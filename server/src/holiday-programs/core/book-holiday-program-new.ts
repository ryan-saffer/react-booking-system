import { v4 as uuidv4 } from 'uuid'
import { SquareClient } from '../../square/core/square-client'
import { getOrCreateCustomer } from '../../square/core/get-or-create-customer'
import { env } from '../../init'
import { logError, throwTrpcError } from '../../utilities'
import { AcuityClient } from '../../acuity/core/acuity-client'
import { AcuityConstants, AcuityUtilities, type DiscountCode } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { ZohoClient } from '../../zoho/zoho-client'
import { SheetsClient } from '../../google/SheetsClient'
import { sendConfirmationEmail } from './send-confirmation-email'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { FieldValue } from 'firebase-admin/firestore'

export type HolidayProgramBookingProps = {
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentPhone: string
    emergencyContactName: string
    emergencyContactPhone: string
    joinMailingList: boolean
    payment: {
        token: string
        buyerVerificationToken: string
        amount: number // in cents
        locationId: string
        lineItems: {
            name: string
            quantity: string
            amount: number // in cents
            classId: number
            lineItemIdentifier: string
            appointmentTypeId: number
            time: string
            calendarId: number
            childName: string
            childDob: string // ISO
            childAllergies: string
            childAdditionalInfo: string
        }[]
        discount: (DiscountCode & { description: string }) | null
    }
}

export async function bookHolidayProgramNew(input: HolidayProgramBookingProps) {
    // TODO verify there are enough spots

    // get or create customer in square
    const customerId = await getOrCreateCustomer(input.parentFirstName, input.parentLastName, input.parentEmail)

    // process payment
    const square = await SquareClient.getInstance()
    const idempotencyKey = uuidv4()

    const { order } = await square.orders
        .create({
            idempotencyKey,
            order: {
                customerId,
                locationId: input.payment.locationId,
                lineItems: input.payment.lineItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    basePriceMoney: { currency: 'AUD', amount: BigInt(item.amount) },
                    catalogObjectId: env === 'prod' ? '4B3QJRX5DK34ZFWVGXRZ4U67' : 'REHIF6QHHSED6UALQA36JMPJ', // Holiday program session
                    metadata: {
                        classId: item.classId.toString(),
                        lineItemIdentifier: item.lineItemIdentifier,
                    },
                })),
                discounts: input.payment.discount
                    ? input.payment.discount.discountType === 'percentage'
                        ? [
                              {
                                  type: 'FIXED_PERCENTAGE',
                                  percentage: input.payment.discount.discountAmount.toFixed(2),
                                  name: input.payment.discount.description,
                              },
                          ]
                        : [
                              {
                                  type: 'FIXED_AMOUNT',
                                  amountMoney: {
                                      currency: 'AUD',
                                      amount: BigInt(input.payment.discount.discountAmount),
                                  },
                                  name: input.payment.discount.description,
                              },
                          ]
                    : null,
                metadata: {
                    programType: 'holiday-program',
                },
            },
        })
        .catch((error) =>
            throwTrpcError('INTERNAL_SERVER_ERROR', 'Error creating order for holiday program payment', error, {
                input,
            })
        )

    const { payment } = await square.payments
        .create({
            sourceId: input.payment.token,
            idempotencyKey,
            locationId: input.payment.locationId,
            amountMoney: {
                currency: 'AUD',
                amount: BigInt(input.payment.amount),
            },
            orderId: order!.id,
            customerDetails: {
                customerInitiated: true,
                sellerKeyedIn: false,
            },
            buyerEmailAddress: input.parentEmail,
            verificationToken: input.payment.buyerVerificationToken,
        })
        .catch((error) =>
            throwTrpcError('INTERNAL_SERVER_ERROR', 'Unable to process payment for holiday program', error, { input })
        )

    console.log(payment)

    const acuity = await AcuityClient.getInstance()
    const appointments = await Promise.all(
        input.payment.lineItems.map((item) =>
            acuity.scheduleAppointment({
                appointmentTypeID: item.appointmentTypeId,
                datetime: item.time,
                calendarID: item.calendarId,
                firstName: input.parentFirstName,
                lastName: input.parentLastName,
                email: input.parentEmail,
                phone: input.parentPhone,
                // certificate: booking.discountCode === 'allday' ? 'allday' : undefined, // TODO mark all days
                paid: true,
                fields: [
                    {
                        id: AcuityConstants.FormFields.CHILDREN_NAMES,
                        value: item.childName,
                    },
                    {
                        id: AcuityConstants.FormFields.CHILDREN_AGES,
                        // convert ISO string to age
                        value: Math.floor(DateTime.now().diff(DateTime.fromISO(item.childDob), 'years').years),
                    },
                    {
                        id: AcuityConstants.FormFields.CHILDREN_ALLERGIES,
                        value: item.childAllergies,
                    },
                    {
                        id: AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO,
                        value: item.childAdditionalInfo,
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
                        id: AcuityConstants.FormFields.PAYMENT_ID,
                        value: order!.id || '',
                    },
                ],
            })
        )
    ).catch((error) =>
        throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error booking a holiday program into acuity', error, {
            input,
            orderId: order?.id,
        })
    )

    const firstProgram = [...input.payment.lineItems].sort((a, b) => (a.time < b.time ? -1 : 1))[0]

    // crm
    if (input.joinMailingList) {
        const zoho = new ZohoClient()
        try {
            for (const line of input.payment.lineItems) {
                await zoho.addHolidayProgramContact({
                    firstName: input.parentFirstName,
                    lastName: input.parentLastName,
                    email: input.parentEmail,
                    mobile: input.parentPhone,
                    studio: AcuityUtilities.getStudioByCalendarId(line.calendarId),
                    childName: line.childName,
                    childBirthdayISO: line.childDob,
                    holidayProgramDateISO: firstProgram.time.split('T')[0],
                })
            }
        } catch (err) {
            logError(`unable to add holiday program booking to zoho with parent email: ${input.parentEmail}`, err, {
                input,
            })
        }
    }

    // write additional info to spreadsheet to contact parent
    const additionaNeedsLineItems = input.payment.lineItems.filter((it) => it.childAdditionalInfo !== '')

    if (additionaNeedsLineItems.length > 0) {
        const sheetsClient = await SheetsClient.getInstance()
        sheetsClient.addRowToSheet(
            'holidayProgramAdditionalNeeds',
            additionaNeedsLineItems.map((item) => [
                appointments[0].calendar,
                item.time,
                input.parentFirstName,
                input.parentLastName,
                input.parentEmail,
                input.parentPhone,
                item.childName,
                Math.abs(DateTime.fromISO(item.childDob).diffNow('years').years).toFixed(0),
                item.childAllergies,
                item.childAdditionalInfo,
            ])
        )
    }

    // confirmation email
    // TODO: add receipt URL
    await sendConfirmationEmail(appointments)

    // if using a discount code, update its number of uses
    const code = input.payment.discount?.code
    if (code) {
        try {
            await DatabaseClient.updateDiscountCode(code, { numberOfUses: FieldValue.increment(1) })
        } catch (err) {
            logError('Error while updating discount code during holiday program registration', err, { code })
        }
    }
}
