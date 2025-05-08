import { AcuityConstants, AcuityUtilities, studioNameAndAddress, type AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { AcuityClient } from '../../acuity/core/acuity-client'
import { logError, throwTrpcError } from '../../utilities'
import { processPaylabPayment } from './process-play-lab-payment'
import { ZohoClient } from '../../zoho/zoho-client'
import { MailClient } from '../../sendgrid/MailClient'

export type BookPlayLabProps = {
    classes: AcuityTypes.Api.Class[]
    parentFirstName: string
    parentLastName: string
    parentPhone: string
    parentEmail: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelation: string
    children: {
        firstName: string
        lastName: string
        dob: string // ISO
        hasAllergies: boolean
        allergies?: string
        additionalInfo?: string
    }[]
    joinMailingList: boolean
    payment: {
        token: string
        locationId: string
        amount: number // in cents
        lineItems: {
            name: string
            amount: number // in cents
            quantity: string
            classId: number
        }[]
        discount: null | { type: 'number' | 'percentage'; amount: number; name: string } // percentage amount in format '7.25' for 7.25%
    }
}

export async function bookPlayLab(input: BookPlayLabProps) {
    // first, verify that every class has enough spots
    const acuity = await AcuityClient.getInstance()

    const uniqueAppointmentTypeIDs = [...new Set(input.classes.map((c) => c.appointmentTypeID))]

    const latestClasses = await acuity.getClasses(uniqueAppointmentTypeIDs, true, Date.now())

    input.classes.forEach((klass) => {
        const matchingClass = latestClasses.find((it) => it.id === klass.id)
        if (!matchingClass) {
            throwTrpcError(
                'UNPROCESSABLE_CONTENT',
                `could not find matching class in acuity for class with id: ${klass.id}`
            )
        }
        if (matchingClass.slotsAvailable < input.children.length) {
            throwTrpcError('CONFLICT', 'One of the selected play lab classes does not have enough spots')
        }
    })

    // all classes have enough spots! let's continue

    // process payment
    const { errors, payment } = await processPaylabPayment(input.payment, input.parentPhone, input.parentEmail)

    if (errors) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error processing play lab transaction', errors, {
            input,
        })
    }

    const discount = input.payment.discount
    // if it's a fixed discount, start with the total amount (in cents) to distribute
    let remainingFixedDiscount = discount?.type === 'number' ? discount.amount : 0

    const schedulingPromises = input.classes.flatMap((klass) => {
        // find the base amount for this class
        const lineItem = input.payment.lineItems.find((it) => it.classId === klass.id)
        const originalAmount = lineItem?.amount ?? 0
        return input.children.map((child) => {
            let amountCharged = originalAmount

            if (discount) {
                if (discount.type === 'percentage') {
                    // subtract X% off
                    amountCharged = (originalAmount * (1 - discount.amount / 100)) / 100
                } else {
                    // fixed-dollar discount: apply as much as possible here
                    const discountApplied = Math.min(remainingFixedDiscount, originalAmount)
                    amountCharged = originalAmount - discountApplied
                    remainingFixedDiscount -= discountApplied
                }
            }

            return acuity.scheduleAppointment({
                appointmentTypeID: klass.appointmentTypeID,
                datetime: klass.time,
                calendarID: klass.calendarID,
                firstName: input.parentFirstName,
                lastName: input.parentLastName,
                email: input.parentEmail,
                phone: input.parentPhone,
                paid: true,
                fields: [
                    {
                        id: AcuityConstants.FormFields.CHILDREN_NAMES,
                        value: `${child.firstName} ${child.lastName}`,
                    },
                    {
                        id: AcuityConstants.FormFields.CHILDREN_AGES,
                        // convert ISO string to age
                        value: Math.floor(DateTime.now().diff(DateTime.fromISO(child.dob), 'years').years),
                    },
                    {
                        id: AcuityConstants.FormFields.CHILDREN_ALLERGIES,
                        value: child.allergies || '',
                    },
                    {
                        id: AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO,
                        value: child.additionalInfo || '',
                    },
                    {
                        id: AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP,
                        value: input.emergencyContactName,
                    },
                    {
                        id: AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP,
                        value: input.emergencyContactPhone,
                    },
                    {
                        id: AcuityConstants.FormFields.AMOUNT_CHARGED,
                        value: amountCharged.toFixed(2),
                    },
                    {
                        id: AcuityConstants.FormFields.PAYMENT_ID,
                        value: payment.id || '',
                    },
                ],
            })
        })
    })

    try {
        await Promise.all(schedulingPromises)
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'there was an error scheduling play lab into acuity', err, { input })
    }

    // write to crm
    if (input.joinMailingList) {
        const zohoClient = new ZohoClient()
        try {
            for (const child of input.children) {
                // cannot use `Promise.all()` here, since each child is added individually.
                // doing them concurrently writes each child into the same free slot, and overwrite each other.
                // the most ideal fix is to pass all children into the zoho client, and the client can handle multiple children at once..
                // but cbf for now.
                await zohoClient.addPlayLabContact({
                    firstName: input.parentFirstName,
                    email: input.parentEmail,
                    studio: AcuityUtilities.getStudioByCalendarId(input.classes[0].calendarID),
                    childName: child.firstName,
                    childBirthdayISO: child.dob.split('T')[0],
                })
            }
        } catch (err) {
            logError(`unable to add play lab booking to zoho with parent email '${input.parentEmail}'`, err, { input })
        }
    }

    // confirmation email
    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('playLabBookingConfirmation', input.parentEmail, {
        parentName: input.parentFirstName,
        location: studioNameAndAddress(AcuityUtilities.getStudioByCalendarId(input.classes[0].calendarID)),
        bookings: input.classes
            .sort((a, b) => (DateTime.fromISO(a.time) > DateTime.fromISO(b.time) ? 1 : -1))
            .flatMap((klass) =>
                input.children.map((child) => {
                    const startTime = DateTime.fromISO(klass.time, { setZone: true })
                    const endTime = startTime.plus({ minutes: klass.duration })
                    return {
                        time: `${startTime.toFormat('cccc, LLL dd, t')} - ${endTime.toFormat('t')}`,
                        details: `${child.firstName} - ${klass.name}`,
                    }
                })
            ),
    })

    return
}
