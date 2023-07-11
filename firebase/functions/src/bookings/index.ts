import * as functions from 'firebase-functions'
// import * as admin from 'firebase-admin'
import { google } from 'googleapis'
import { DateTime } from 'luxon'
import { AppsScript } from 'fizz-kidz'

import { db } from '../init'

import googleCredentials from '../../credentials/google-credentials.json'

export const updateBooking = functions.region('australia-southeast1').https.onCall((data) => {
    return new Promise((resolve, reject) => {
        const partyDetails = JSON.parse(data.data)
        const bookingId = partyDetails.bookingId
        const booking = partyDetails.booking
        booking.dateTime = new Date(booking.dateTime)
        const documentRef = db.collection('bookings').doc(bookingId)
        // update calendar event and any generated sheets on apps script
        console.log('running apps script...')
        runAppsScript(AppsScript.Functions.UPDATE_BOOKING, [data.data])
            .then(() => {
                console.log('finished apps script')
                // then update database
                documentRef
                    .set({
                        ...booking,
                    })
                    .then((writeResult) => {
                        resolve(writeResult)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                console.log('Error running AppsScript')
                reject(err)
            })
    })
})

export const deleteBooking = functions.region('australia-southeast1').https.onCall((data) => {
    return new Promise((resolve, reject) => {
        const bookingId = data.data.bookingId
        const booking = data.data.booking
        const documentRef = db.collection('bookings').doc(bookingId)
        console.log('running apps script...')
        runAppsScript(AppsScript.Functions.DELETE_BOOKING, [booking])
            .then(() => {
                console.log('finished apps script')
                // then update database
                documentRef
                    .delete()
                    .then((writeResult) => {
                        resolve(writeResult)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                console.log('Error running AppsScript')
                reject(err)
            })
    })
})

export const sendFeedbackEmails = functions
    .region('australia-southeast1')
    .pubsub.schedule('30 8 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(() => {
        const startDate = DateTime.fromObject(
            { hour: 0, minute: 0, second: 0 },
            { zone: 'Australia/Melbourne' }
        ).toJSDate()
        startDate.setDate(startDate.getDate() - 1) // yesterday
        const endDate = DateTime.fromObject(
            { hour: 0, minute: 0, second: 0 },
            { zone: 'Australia/Melbourne' }
        ).toJSDate() // today

        console.log('Start date:')
        console.log(startDate)
        console.log('End date:')
        console.log(endDate)

        const bookings: any[] = []

        return new Promise<void>((resolve, reject) => {
            db.collection('bookings')
                .where('dateTime', '>', startDate)
                .where('dateTime', '<', endDate)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((documentSnapshot) => {
                        const booking = documentSnapshot.data()
                        booking.dateTime = booking.dateTime.toDate()
                        bookings.push(booking)
                    })
                    console.log('running apps script...')
                    runAppsScript(AppsScript.Functions.SEND_FEEDBACK_EMAILS, [bookings])
                        .then(() => {
                            console.log('finished apps script successfully')
                            resolve()
                        })
                        .catch((err) => {
                            console.log('Error running apps script')
                            reject(err)
                        })
                })
                .catch((err) => {
                    console.log('Error fetching bookings from firestore')
                    reject(err)
                })
        })
    })

export function runAppsScript(functionName: string, parameters: any[]) {
    const scriptId = '1nvPPH76NCCZfMYNWObohW4FmW-NjLWgtHk-WdBYh2McYSXnJlV5HTf42'
    const script = google.script('v1')

    const oAuth2Client = new google.auth.OAuth2(
        googleCredentials.web.client_id,
        googleCredentials.web.client_secret,
        googleCredentials.web.redirect_uris[0]
    )

    oAuth2Client.setCredentials({
        refresh_token: googleCredentials.refresh_token,
    })

    // Tell apps-script which environment we are using, in order to use correct calendar ID's
    // This is shit... and ideally there would be a prod/dev environment for apps script, but this is hard.
    // More ideally, we would not use apps script at all, and instead call the Gmail/Calendar/Forms APIs directly from here.
    const environment = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
    parameters.push(environment)

    return new Promise<string>((resolve, reject) => {
        script.scripts.run(
            {
                auth: oAuth2Client,
                requestBody: {
                    function: functionName,
                    parameters: parameters,
                    devMode: true,
                },
                scriptId: scriptId,
            },
            (err, resp) => {
                if (err) {
                    // The API encountered a problem before the script started executing
                    console.log('The API returned an error: ' + err)
                    reject(err)
                }
                if (resp?.data.error) {
                    // The API executed, but the script returned an error.

                    // Extract the first (and only) set of error details. The values of this
                    // object are the script's 'errorMessage' and 'errorType', and an array
                    // of stack trace elements.
                    const error = resp.data.error.details?.[0]
                    console.log('Script error message: ' + error?.errorMessage)
                    console.log('Script error stacktrace:')

                    if (error?.scriptStackTraceElements) {
                        // There may not be a stacktrace if the script didn't start executing.
                        for (const trace of error.scriptStackTraceElements) {
                            console.log('\t%s: %s', trace.function, trace.lineNumber)
                        }
                    }
                    reject(resp.data.error)
                } else {
                    resolve(JSON.stringify(resp?.data))
                }
            }
        )
    })
}

export * from './functions/createPartyBooking'
