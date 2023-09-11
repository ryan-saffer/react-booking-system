import { Booking, Locations, capitalise, getManager } from 'fizz-kidz'
import * as functions from 'firebase-functions'
import { FormMapper } from '../core/FormMapper'
import { PFQuestion } from '../core/types'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getMailClient } from '../../sendgrid/MailClient'
import { getBookingAdditions, getBookingCreations } from '../core/utils'
import { DateTime } from 'luxon'
import { logError } from '../../utilities'

export const onPartyFormSubmit = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    console.log(req.body.data)

    res.status(200).send()

    const responses = req.body.data as PFQuestion<any>[]
    let booking: Partial<Booking> = {}
    const formMapper = new FormMapper(responses)

    try {
        booking = formMapper.mapToBooking()
        booking.partyFormFilledIn = true
        console.log(booking)
    } catch (err) {
        logError('error handling party form submission', err)
        return
    }

    const mailClient = getMailClient()

    // first check if the booking form has been filled in previously
    const existingBooking = await FirestoreClient.getPartyBooking(formMapper.bookingId)
    if (existingBooking.partyFormFilledIn) {
        // form has been filled in before, notify manager of the change
        try {
            await mailClient.sendEmail(
                'partyFormFilledInAgain',
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
                    newCreations: formMapper.getCreationDisplayValues(),
                    newAdditions: formMapper.getAdditionDisplayValues(false),
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

    // write to firestore
    await FirestoreClient.updatePartyBooking(formMapper.bookingId, booking)

    const fullBooking = await FirestoreClient.getPartyBooking(formMapper.bookingId)

    // if its a two creation party, but they picked three or more creations, notify manager
    const choseThreeCreations = booking.creation3 !== undefined
    const requiresTwoCreations =
        (fullBooking.location === 'mobile' && fullBooking.partyLength === '1') ||
        (fullBooking.location !== 'mobile' && fullBooking.partyLength === '1.5')
    if (choseThreeCreations && requiresTwoCreations) {
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
                    chosenCreations: formMapper.getCreationDisplayValues(),
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
    const creations = formMapper.getCreationDisplayValues()

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
            'partyFormConfirmation',
            fullBooking.parentEmail,
            {
                parentName: fullBooking.parentFirstName,
                numberOfChildren: fullBooking.numberOfChildren,
                creations,
                isTyeDyeParty: creations.find((it) => it.includes('Tie Dye')) !== undefined,
                hasAdditions: additions.length !== 0,
                additions,
                isMobile: fullBooking.location === Locations.MOBILE,
                hasQuestions: fullBooking.questions !== '' || fullBooking.questions !== undefined,
                managerName: manager.name,
                managerMobile: manager.mobile,
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

    return
})
