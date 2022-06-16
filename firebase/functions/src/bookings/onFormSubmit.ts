import { AppsScript, Booking } from 'fizz-kidz';
import * as functions from 'firebase-functions'
import { runAppsScript } from './index'
import { db } from '../index'
import { FormMapper } from './FormMapper';
import { PFQuestion } from './types';

export const onFormSubmit = functions
    .region('australia-southeast1')
    .https.onRequest(async (req, res) => {

        console.log(req.body.data)

        const responses = req.body.data as PFQuestion<any>[]
        let booking: Partial<Booking> = {}
        let formMapper = new FormMapper(responses)
        
        try {
            booking = formMapper.mapToBooking()
            console.log(booking)
        } catch (e) {
            console.log(e)
            res.status(500).end(e)
            return
        }

        // write to firestore
        await db.doc(`bookings/${formMapper.bookingId}`).set(booking, { merge: true })

        let documentSnapshot = await db.doc(`bookings/${formMapper.bookingId}`).get()
        let fullBooking = documentSnapshot.data()
        if (fullBooking) {
            fullBooking.dateTime = fullBooking.dateTime.toDate()
        }

        try {
            await runAppsScript(
                AppsScript.Functions.ON_FORM_SUBMIT,
                [
                    fullBooking,
                    formMapper.getCreationDisplayValues(),
                    formMapper.getAdditionDisplayValues()
                ]
            )
        } catch(err) {
            functions.logger.error(`error running ${AppsScript.Functions.ON_FORM_SUBMIT}`)
            functions.logger.error(err)
            res.status(500).end(err)
            return
        }

        res.status(200).send()
        return
    })