import { FieldValue } from 'firebase-admin/firestore'
import type { DiscountCode } from 'fizz-kidz'
import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { DatabaseClient } from '@/firebase/DatabaseClient'
import { SheetsClient } from '@/google/SheetsClient'
import { env } from '@/init'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { logError, throwTrpcError } from '@/utilities'
import { ZohoClient } from '@/zoho/zoho-client'

import { sendConfirmationEmail } from './send-confirmation-email'

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
            title?: string // eg. 'Swifty Spectacular'. For mixpanel.
            creations?: string[] // for mixpanel
        }[]
        discount: (DiscountCode & { description: string }) | null
    }
}

export async function bookHolidayProgram(input: HolidayProgramBookingProps) {
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

    let recieptUrl: string | undefined = undefined
    if (order?.totalMoney?.amount === BigInt(0)) {
        await square.orders.pay({ orderId: order!.id!, paymentIds: [], idempotencyKey })
    } else {
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
                throwTrpcError('INTERNAL_SERVER_ERROR', 'Unable to process payment for holiday program', error, {
                    input,
                })
            )
        recieptUrl = payment!.receiptUrl
    }

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
                        id: AcuityConstants.FormFields.ORDER_ID,
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
    await sendConfirmationEmail(appointments, recieptUrl)

    // if using a discount code, update its number of uses
    const code = input.payment.discount?.code
    if (code) {
        try {
            await DatabaseClient.updateDiscountCode(code, { numberOfUses: FieldValue.increment(1) })
        } catch (err) {
            logError('Error while updating discount code during holiday program registration', err, { code })
        }
    }

    // tracking
    const location = AcuityUtilities.getStudioByCalendarId(firstProgram.calendarId)
    // not currently tracking other programs (ie kingsville opening)
    if (location !== 'test' && firstProgram.appointmentTypeId === AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM) {
        const mixpanel = await MixpanelClient.getInstance()

        const uniqueChildNamesCount = new Set(input.payment.lineItems.map((b) => b.childName)).size

        const childAgesSet = new Set(
            input.payment.lineItems.map((item) =>
                Math.abs(DateTime.fromISO(item.childDob).diffNow('years').years).toFixed(0)
            )
        )
        const titlesSet = new Set(input.payment.lineItems.map((item) => item.title).filter((it) => it !== undefined))
        const creationsSet = new Set(
            input.payment.lineItems.reduce(
                (acc, item) => [...acc, ...(item.creations ? item.creations : [])],
                [] as string[]
            )
        )

        const childAges = [...childAgesSet]
        const titles = [...titlesSet]
        const creations = [...creationsSet]

        await mixpanel.track('holiday-program-booking', {
            distinct_id: input.parentEmail,
            location,
            amount: input.payment.amount / 100,
            numberOfSlots: input.payment.lineItems.length,
            numberOfKids: uniqueChildNamesCount,
            childAges,
            ...(code && { discountCode: code }),
            ...(titles.length && { titles }),
            ...(creations.length && { creations }),
        })
    }
}
