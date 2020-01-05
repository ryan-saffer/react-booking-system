const functions = require('firebase-functions');
const admin = require('firebase-admin')
const {
  google
} = require('googleapis');

const googleCredentials = require('./credentials.json')

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.createBooking = functions.https.onCall((data, context) => {
  console.log(data)
  console.log(context)

  return new Promise((resolve, reject) => {
    var partyDetails = JSON.parse(data.data)
    partyDetails.dateTime = admin.firestore.Timestamp.fromDate(new Date(partyDetails.dateTime))
    const doc = db.collection('bookings').doc()
    doc.set({
      ...partyDetails
    })
      .then(writeResult => {
        console.log(`Write Result: ${JSON.stringify(writeResult)}`)
        runAppsScript('createBooking', data.data)
          .then(appsScriptResult => {
            appsScriptResult = JSON.parse(appsScriptResult)
            console.log(appsScriptResult)
            var eventId = appsScriptResult.response.result
            if (eventId) {
              doc.set({ eventId: eventId }, { merge: true })
              .then(updateResult => {
                resolve(updateResult)
              }) 
            } else {
              reject(appsScriptResult)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
      .catch(err => {
        reject(err)
      })
  })
})

exports.updateBooking = functions.https.onCall((data, context) => {
  console.log(data)
  console.log(context)

  return new Promise((resolve, reject) => {
    var partyDetails = JSON.parse(data.data)
    const bookingId = partyDetails.bookingId
    const booking = partyDetails.booking
    booking.dateTime = admin.firestore.Timestamp.fromDate(new Date(booking.dateTime))
    const documentRef = db.collection('bookings').doc(bookingId)
    // update calendar event and any generated sheets on apps script
    runAppsScript('updateBooking', data.data)
      .then(() => {
        // then update database
        documentRef.set({
            ...booking
        }).then(writeResult => {
          resolve(writeResult)
        }).catch(err => {
          reject(err)
        })
      })
      .catch(err => {
        reject(err)
      })
  })
})

function runAppsScript(functionName, booking) {
  const scriptId = '1nvPPH76NCCZfMYNWObohW4FmW-NjLWgtHk-WdBYh2McYSXnJlV5HTf42'
  const script = google.script('v1')

  const oAuth2Client = new google.auth.OAuth2(
    googleCredentials.web.client_id,
    googleCredentials.web.client_secret,
    googleCredentials.web.redirect_uris[0]
  )

  oAuth2Client.setCredentials({
    refresh_token: googleCredentials.refresh_token
  })

  return new Promise((resolve, reject) => {
    script.scripts.run({
      auth: oAuth2Client,
      resource: {
        function: functionName,
        parameters: [
          booking
        ],
        devMode: true
      },
      scriptId: scriptId
    }, (err, resp) => {
      if (err) {
        // The API encountered a problem before the script started executing
        console.log('The API returned an error: ' + err);
        reject(err)
      }
      if (resp.data.error) {
        // The API executed, but the script returned an error.

        // Extract the first (and only) set of error details. The values of this
        // object are the script's 'errorMessage' and 'errorType', and an array
        // of stack trace elements.
        const error = resp.data.error.details[0];
        console.log('Script error message: ' + error.errorMessage);
        console.log('Script error stacktrace:');

        if (error.scriptStackTraceElements) {
          // There may not be a stacktrace if the script didn't start executing.
          for (let i = 0; i < error.scriptStackTraceElements.length; i++) {
            const trace = error.scriptStackTraceElements[i];
            console.log('\t%s: %s', trace.function, trace.lineNumber);
          }
        }
        reject(resp.data.error)
      } else {
        resolve(JSON.stringify(resp.data))
      }
    })
  })
}