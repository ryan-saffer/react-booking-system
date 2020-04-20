const functions = require('firebase-functions');
const Acuity = require('acuityscheduling')
const acuityCredentials = require('../acuity_credentials.json')

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