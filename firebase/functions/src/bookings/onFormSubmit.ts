import { AppsScript, Booking } from 'fizz-kidz'
import * as functions from 'firebase-functions'
import { runAppsScript } from './index'
import { FormMapper } from './FormMapper'
import { PFQuestion } from './types'
import { FirestoreClient } from '../firebase/FirestoreClient'
import { mailClient } from '../sendgrid/MailClient'
import { getBookingAdditions, getBookingCreations, getManagerEmail } from './utils'
import { DateTime } from 'luxon'

export const onFormSubmit = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    console.log(req.body.data)

    const responses = req.body.data as PFQuestion<any>[]
    let booking: Partial<Booking> = {}
    const formMapper = new FormMapper(responses)

    try {
        booking = formMapper.mapToBooking()
        booking.partyFormFilledIn = true
        console.log(booking)
    } catch (e) {
        console.log(e)
        res.status(500).end(e)
        return
    }

    // first check if the booking form has been filled in previously
    const existingBooking = await FirestoreClient.getPartyBooking(formMapper.bookingId)
    if (existingBooking.partyFormFilledIn) {
        // form has been filled in before, notify manager of the change
        await mailClient.sendEmail(
            'partyFormFilledInAgain',
            getManagerEmail(booking.location!),
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
            `Party form filled in again for ${booking.parentFirstName} ${booking.parentLastName}`
        )
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
        await mailClient.sendEmail('tooManyCreationsChosen', getManagerEmail(fullBooking.location), {
            parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
            parentEmail: fullBooking.parentEmail,
            parentMobile: fullBooking.parentMobile,
            childName: fullBooking.childName,
            dateTime: DateTime.fromJSDate(fullBooking.dateTime, {
                zone: 'Australia/Melbourne',
            }).toLocaleString(DateTime.DATETIME_SHORT),
            chosenCreations: formMapper.getCreationDisplayValues(),
        })
    }

    try {
        await runAppsScript(AppsScript.Functions.ON_FORM_SUBMIT, [
            fullBooking,
            formMapper.getCreationDisplayValues(),
            formMapper.getAdditionDisplayValues(true),
        ])
    } catch (err) {
        functions.logger.error(`error running ${AppsScript.Functions.ON_FORM_SUBMIT}`)
        functions.logger.error(err)
        res.status(500).end(err)
        return
    }

    res.status(200).send()
    return
})
