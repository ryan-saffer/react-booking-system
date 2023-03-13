import { AppsScript, Booking } from 'fizz-kidz'
import * as functions from 'firebase-functions'
import { runAppsScript } from './index'
import { db } from '../init'
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
    const existingBooking = (await FirestoreClient.getPartyBooking(formMapper.bookingId)).data()!
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
                dateTime: DateTime.fromJSDate(existingBooking.dateTime.toDate(), {
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

    const documentSnapshot = await db.doc(`bookings/${formMapper.bookingId}`).get()
    const fullBooking = documentSnapshot.data()
    if (fullBooking) {
        fullBooking.dateTime = fullBooking.dateTime.toDate()
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
