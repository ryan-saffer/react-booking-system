const functions = require('firebase-functions');
const admin = require('firebase-admin')
const {
  google
} = require('googleapis');

const googleCredentials = require('./credentials.json')
const acuityCredentials = require('./acuity_credentials.json')

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
        runAppsScript('createBooking', [data.data])
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
    runAppsScript('updateBooking', [data.data])
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

exports.deleteBooking = functions.https.onCall((data, context) => {
  console.log(data)
  console.log(context)

  return new Promise((resolve, reject) => {
    const bookingId = data.data.bookingId
    const booking = data.data.booking
    const documentRef = db.collection('bookings').doc(bookingId)
    runAppsScript('deleteBooking', [booking])
      .then(() => {
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
        reject(err)
      })
  })
})

exports.sendOutForms = functions.pubsub.schedule('30 8 * * 4')
  .timeZone('Australia/Victoria')
  .onRun((context) => {
    
    return new Promise((resolve, reject) => {
      var startDate = new Date()
      startDate.setDate(startDate.getDate() + ((5 + 7 - startDate.getDay()) % 7) + 7) // will always get second upcoming friday
      startDate.setHours(0, 0, 0, 0)
      var endDate = new Date()
      endDate.setDate(startDate.getDate() + 3)
      endDate.setHours(0, 0, 0, 0)

      console.log(`Start date: ${startDate}`)
      console.log(`End date: ${endDate}`)
      
      startDate = admin.firestore.Timestamp.fromDate(startDate)
      endDate = admin.firestore.Timestamp.fromDate(endDate)

      var bookings = []

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
          runAppsScript('sendOutForms', [bookings])
            .then(() => {
              resolve()
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

function runAppsScript(functionName, parameters) {
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

var Acuity = require('acuityscheduling')
var acuity = Acuity.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

exports.getAppointmentTypes = functions
  .https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    acuity.request('appointment-types', (err, resp, appointmentTypes) => {
      if (err) reject(err)
      resolve(appointmentTypes)
    })
  })
})

exports.getCalendars = functions
  .https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      acuity.request('calendars', (err, resp, calendars) => {
        if (err) reject(err)
        resolve(calendars)
      })
    })
})

exports.getClasses = functions
  .https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      var id = data.data
      acuity.request(`/availability/classes?appointmentTypeID=${id}&includeUnavailable=true`, (err, resp, classes) => {
        if (err) reject(err)
        resolve(classes)
      })
  })
})

exports.getAppointments = functions
  .https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      var fields = data.data
      console.log(fields)
      acuity.request(
        `/appointments?appointmentTypeID=${fields.appointmentTypeID}&calendarID=${fields.calendarID}&max=500`,
        (err, resp, appointments) => {
          if (err) reject(err)
          resolve(appointments)
      })
    })
})

exports.getLabels = functions
  .https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      acuity.request("labels", (err, resp, labels) => {
        if (err) reject(err)
        resolve(labels)
      })
  })
  })

exports.updateLabel = functions
  .https.onCall((data, context) => {

    var clientId = data.data.clientId
    var label = data.data.label
    var options = {
      method: 'PUT',
      body: {
        labels: [
          { id: label }
        ]
      }
    }

    return new Promise((resolve, reject) => {
      acuity.request(`/appointments/${clientId}`, options, (err, res, appointment) => {
        if (err) reject(err)
        resolve(appointment)
      })
    })
  })