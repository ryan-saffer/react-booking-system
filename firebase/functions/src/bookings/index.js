const functions = require('firebase-functions');
const admin = require('firebase-admin')
const {
  google
} = require('googleapis');
var { DateTime } = require('luxon')

const googleCredentials = require('../../credentials/google-credentials.json')

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

exports.createBooking = functions
  .region('australia-southeast1')
  .https.onCall((data, context) => {

    return new Promise((resolve, reject) => {
      var partyDetails = JSON.parse(data.data)
      partyDetails.dateTime = admin.firestore.Timestamp.fromDate(new Date(partyDetails.dateTime))
      const doc = db.collection('bookings').doc()
      doc.set({
        ...partyDetails
      })
        .then(writeResult => {
          console.log(`Write Result: ${JSON.stringify(writeResult)}`)
          console.log('running apps script...')
          runAppsScript('createBooking', [data.data])
            .then(appsScriptResult => {
              console.log('finished apps script')
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
              console.log("Error running AppsScript")
              reject(err)
            })
        })
        .catch(err => {
          reject(err)
        })
    })
})

exports.updateBooking = functions
  .region('australia-southeast1')
  .https.onCall((data, context) => {
    
    return new Promise((resolve, reject) => {
      var partyDetails = JSON.parse(data.data)
      const bookingId = partyDetails.bookingId
      const booking = partyDetails.booking
      booking.dateTime = admin.firestore.Timestamp.fromDate(new Date(booking.dateTime))
      const documentRef = db.collection('bookings').doc(bookingId)
      // update calendar event and any generated sheets on apps script
      console.log('running apps script...')
      runAppsScript('updateBooking', [data.data])
        .then(() => {
          console.log('finished apps script')
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
          console.log("Error running AppsScript")
          reject(err)
        })
    })
})

exports.deleteBooking = functions
  .region('australia-southeast1')
  .https.onCall((data, context) => {
    
    return new Promise((resolve, reject) => {
      const bookingId = data.data.bookingId
      const booking = data.data.booking
      const documentRef = db.collection('bookings').doc(bookingId)
      console.log('running apps script...')
      runAppsScript('deleteBooking', [booking])
        .then(() => {
          console.log('finished apps script')
          // then update database
          documentRef.delete()
            .then(writeResult => {
              resolve(writeResult)
            })
            .catch(err => {
              reject(err)
          })
        })
        .catch(err => {
          console.log("Error running AppsScript")
          reject(err)
        })
    })
})

exports.sendOutForms = functions
  .region('australia-southeast1')
  .pubsub.schedule('30 8 * * 4')
  .timeZone('Australia/Victoria')
  .onRun((context) => {
    
    var startDate = DateTime.fromObject({ zone: "Australia/Melbourne", hour: 0, minute: 0, second: 0 }).toJSDate()
    startDate.setDate(startDate.getDate() + ((1 + 7 - startDate.getDay()) % 7)) // will always get upcoming Tuesday
    var endDate = DateTime.fromObject({ zone: "Australia/Melbourne", hour: 0, minute: 0, second: 0 }).toJSDate()
    endDate.setDate(startDate.getDate() + 7)

    console.log("Start date:")
    console.log(startDate)
    console.log("End date:")
    console.log(endDate)

    var bookings = []

    return new Promise((resolve, reject) => {
      db.collection('bookings')
      .where('dateTime', '>', startDate)
      .where('dateTime', '<', endDate)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          var booking = documentSnapshot.data()
          booking.dateTime = booking.dateTime.toDate()
          bookings.push(booking)
        })
        console.log('running apps script...')
        runAppsScript('sendOutForms', [bookings])
          .then(() => {
            console.log('finished apps script')
            resolve()
          })
          .catch(err => {
            console.log("Error running AppsScript")
            reject(err)
          })
      })
      .catch(err => {
        console.log("Error fetching bookings from firestore")
        reject(err)
      })
    })
  })

export function runAppsScript(functionName, parameters) {
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

  // Tell apps-script which environment we are using, in order to use correct calendar ID's
  // This is shit... and ideally there would be a prod/dev environment for apps script, but this is hard.
  // More ideally, we would not use apps script at all, and instead call the Gmail/Calendar/Forms APIs directly from here.
  let environment = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? "prod" : "dev"
  parameters.push(environment)

  return new Promise((resolve, reject) => {
    script.scripts.run({
      auth: oAuth2Client,
      resource: {
        function: functionName,
        parameters: parameters,
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