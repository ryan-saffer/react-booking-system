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
    db.collection('bookings').doc().set({
      ...partyDetails
    }).then(writeResult => {
      console.log(`Write Result: ${JSON.stringify(writeResult)}`)
      callAppsScript(resolve, reject, data.data)
    })
  })
})

function callAppsScript(resolve, reject, partyDetails) {

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

  script.scripts.run({
    auth: oAuth2Client,
    resource: {
      function: 'myFunction',
      parameters: [
        partyDetails
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
    if (resp.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      const error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (let i = 0; i < error.scriptStackTraceElements.length; i++) {
          const trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
      reject(resp.err)
    } else {
      resolve(JSON.stringify(resp.data))
    }
  })
}