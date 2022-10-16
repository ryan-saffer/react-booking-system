import * as functions from 'firebase-functions'
import { runAppsScript } from '.'
import { db } from '../init'
import { AppsScript } from 'fizz-kidz'

export const sendOutSingleForm = functions
    .region('australia-southeast1')
    .https
    // .onCall((data: { id: string }, _context: functions.https.CallableContext) => {
    .onRequest(async (req, resp) => {

        let data = req.body as { id: string }
        
        try {
            let snapshot = await db.doc(`bookings/${data.id}`).get()
            if (snapshot.exists) {
                let booking = snapshot.data() as FirebaseFirestore.DocumentData
                booking.dateTime = booking.dateTime.toDate()
                booking.id = data.id
                try {
                    await runAppsScript(AppsScript.Functions.SEND_OUT_FORMS, [[booking]])
                    console.log('finished apps script')
                    resp.status(200).send()
                    return
                } catch(err) {
                    console.log("Error running AppsScript")
                    resp.status(500).send(err)
                    return
                }
            } else {
                resp.status(500).send("booking does not exist")
                return
            }
        } catch(err) {
            console.log("Error fetching bookings from firestore")
            resp.status(500).send(err)
            return
        }
    })