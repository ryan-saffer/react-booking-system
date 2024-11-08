import { logger } from 'firebase-functions/v2'
import { Booking, PaperFormResponse, PartyFormV2, capitalise, getManager } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, throwFunctionsError } from '../../utilities'
import { PartyFormMapperV2 } from './party-form-mapper-v2'
import { getBookingAdditions, getBookingCreations } from './utils.party'

export async function handlePartyFormSubmissionV2(responses: PaperFormResponse<PartyFormV2>, charge: any) {
    const formMapper = new PartyFormMapperV2(responses)
    const existingBooking = await DatabaseClient.getPartyBooking(formMapper.bookingId)

    console.log({ charge })

    let booking: Partial<Booking> = {}
    try {
        booking = formMapper.mapToBooking(existingBooking.type, existingBooking.location)
        booking.partyFormFilledIn = true
        logger.log(booking)
    } catch (err) {
        logError('error handling party form submission', err, { responses })
        return
    }

    const mailClient = await MailClient.getInstance()

    // first check if the booking form has been filled in previously
    if (existingBooking.partyFormFilledIn) {
        // form has been filled in before, notify manager of the change
        try {
            await mailClient.sendEmail(
                'partyFormFilledInAgainV2',
                getManager(booking.location!).email,
                {
                    parentName: `${booking.parentFirstName} ${booking.parentLastName}`,
                    parentEmail: existingBooking.parentEmail,
                    parentMobile: existingBooking.parentMobile,
                    childName: booking.childName!,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATETIME_SHORT),
                    oldNumberOfKids: existingBooking.numberOfChildren,
                    oldCreations: getBookingCreations(existingBooking),
                    oldAdditions: getBookingAdditions(existingBooking),
                    newNumberOfKids: booking.numberOfChildren!,
                    newCreations: formMapper.getCreationDisplayValues(existingBooking.type),
                    newAdditions: formMapper.getAdditionDisplayValues(false),
                    oldIncludesFood: existingBooking.includesFood,
                    newIncludesFood: booking.includesFood!,
                    isMobile: existingBooking.type === 'mobile',
                },
                {
                    subject: `Party form filled in again for ${booking.parentFirstName} ${booking.parentLastName}`,
                }
            )
        } catch (err) {
            logError(
                `error sending party form filled in again notificaiton for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // this checks if they have changed their selected food package. if so, alert the manager.
    // this is different to the 'form filled in again' email, since this can trigger even on the first submission.
    if (existingBooking.type === 'studio' && existingBooking.includesFood !== booking.includesFood) {
        try {
            await mailClient.sendEmail(
                'partyFormFoodPackageChanged',
                getManager(booking.location!).email,
                {
                    parentName: `${booking.parentFirstName} ${booking.parentLastName}`,
                    parentEmail: existingBooking.parentEmail,
                    parentMobile: existingBooking.parentMobile,
                    childName: booking.childName!,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATETIME_SHORT),
                    oldIncludesFood: existingBooking.includesFood,
                    newIncludesFood: booking.includesFood!,
                },
                {
                    subject: `Food package has changed for ${booking.parentFirstName} ${booking.parentLastName}`,
                }
            )
        } catch (err) {
            logError(
                `error sending food package changed notificaiton for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // write to firestore
    try {
        await DatabaseClient.updatePartyBooking(formMapper.bookingId, booking)
    } catch (err) {
        logError('error updating party booking', err, booking)
        throwFunctionsError('internal', 'error updating party booking', err, booking)
    }

    const fullBooking = await DatabaseClient.getPartyBooking(formMapper.bookingId)

    // if its a two creation party, but they picked three or more creations, notify manager (or if they picked more than 3 creations)
    const creations = formMapper.getCreationDisplayValues(existingBooking.type)
    const choseThreeCreations = creations.length === 3
    const requiresTwoCreations =
        (fullBooking.type === 'mobile' && fullBooking.partyLength === '1') ||
        (fullBooking.type !== 'mobile' && fullBooking.partyLength === '1.5')

    if ((choseThreeCreations && requiresTwoCreations) || creations.length > 3) {
        try {
            await mailClient.sendEmail(
                'tooManyCreationsChosen',
                getManager(fullBooking.location).email,
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    parentEmail: fullBooking.parentEmail,
                    parentMobile: fullBooking.parentMobile,
                    childName: fullBooking.childName,
                    dateTime: DateTime.fromJSDate(fullBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATE_HUGE),
                    chosenCreations: formMapper.getCreationDisplayValues(existingBooking.type),
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(
                `error sending too many creations notification for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    const manager = getManager(fullBooking.location)

    if (fullBooking.questions) {
        try {
            await mailClient.sendEmail(
                'partyFormQuestions',
                manager.email,
                {
                    dateTime: DateTime.fromJSDate(fullBooking.dateTime, { zone: 'Australia/Melbourne' }).toLocaleString(
                        DateTime.DATE_HUGE
                    ),
                    location: capitalise(fullBooking.location),
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    childName: fullBooking.childName,
                    questions: fullBooking.questions,
                    parentEmail: fullBooking.parentEmail,
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(
                `error sending party form questions notification for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // Grazing platter email not migrated from apps script - need to do if we ever bring them back

    const additions = formMapper.getAdditionDisplayValues(true)

    const partyPacks = additions.filter((addition) => addition.includes('Party Pack'))
    if (partyPacks.length !== 0) {
        try {
            await mailClient.sendEmail(
                'partyPackNotification',
                manager.email,
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    dateTime: DateTime.fromJSDate(fullBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATE_HUGE),
                    location: capitalise(fullBooking.location),
                    mobile: fullBooking.parentMobile,
                    email: fullBooking.parentEmail,
                    partyPacks,
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(`error sending party pack notification for booking with id: '${formMapper.bookingId}'`, err)
        }
    }

    try {
        await mailClient.sendEmail(
            'partyFormConfirmationV2',
            fullBooking.parentEmail,
            {
                parentName: fullBooking.parentFirstName,
                numberOfChildren: fullBooking.numberOfChildren,
                creations,
                isTyeDyeParty: creations.find((it) => it.includes('Tie Dye')) !== undefined,
                hasAdditions: additions.length !== 0,
                additions,
                isMobile: fullBooking.type === 'mobile',
                hasQuestions: fullBooking.questions !== '' || fullBooking.questions !== undefined,
                managerName: manager.name,
                managerMobile: manager.mobile,
                includesFood: fullBooking.type === 'studio' && fullBooking.includesFood,
            },
            {
                from: {
                    name: 'Fizz Kidz',
                    email: manager.email,
                },
                replyTo: manager.email,
            }
        )
    } catch (err) {
        logError(`error sending party form confirmation email for booking with id: '${formMapper.bookingId}'`, err)
    }
}
