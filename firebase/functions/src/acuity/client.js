const functions = require('firebase-functions');
const Acuity = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')

var acuity = Acuity.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

// wrap all functions inside one handler, so coldstart will only occur for first invocation.
exports.client = functions
  .region('australia-southeast1')
  .https.onCall((networkData, _context) => {
    
  return new Promise((resolve, reject) => {
    const data = networkData.data
    if (data == null) {
      reject(new Error(`data is null: ${networkData}`))
    }
    const method = data.method
    switch (method) {
      case 'getAppointmentTypes':
        getAppointmentTypes(resolve, reject)
        break
      case 'getCalendars':
        getCalendars(resolve, reject)
        break
      case 'getClasses':
        getClasses(data, resolve, reject)
        break
      case 'getAppointments':
        getAppointments(data, resolve, reject)
        break
      case 'updateLabel':
        updateLabel(data, resolve, reject)
        break
      case 'getLabels':
        getLabels(resolve, reject)
        break
      default:
        reject(new Error(`invalid method: ${method}`))
        break
    }
  })
})

function getAppointmentTypes(resolve, reject) {
  acuity.request('appointment-types', (err, _resp, appointmentTypes) => {
    if (err) {
      reject(err)
    }
    resolve(appointmentTypes)
  })
}

function getCalendars(resolve, reject) {
  acuity.request('calendars', (err, _resp, calendars) => {
    if (err) {
      reject(err)
    }
    resolve(calendars)
  })
}

function getClasses(data, resolve, reject) {
  sanitise("appointmentTypeID", data.id, reject)
  acuity.request(`/availability/classes?appointmentTypeID=${data.id}&includeUnavailable=true`, (err, resp, classes) => {
    if (err) {
      reject(err)
    }
    resolve(classes)
  })
}

function getAppointments(data, resolve, reject) {
  sanitise("appointmentTypeID", data.appointmentTypeID, reject)
  sanitise("calendarID", data.calendarID, reject)
  acuity.request(
    `/appointments?appointmentTypeID=${data.appointmentTypeID}&calendarID=${data.calendarID}&max=500`,
    (err, resp, appointments) => {
      if (err) {
        reject(err)
      }
      resolve(appointments)
  })
}

function updateLabel(data, resolve, reject) {
  sanitise("clientId", data.clientId, reject)
  sanitise("label", data.label, reject)

  var options = {
    method: 'PUT',
    body: {
      labels: [
        { id: data.label }
      ]
    }
  }

  acuity.request(`/appointments/${data.clientId}`, options, (err, _res, appointment) => {
    if (err) {
      reject(err)
    }
    resolve(appointment)
  })
}

// not used yet
function getLabels(resolve, reject) {
  acuity.request("labels", (err, _resp, labels) => {
    if (err) {
      reject(err)
    }
    resolve(labels)
  })
}

function sanitise(field, value, reject) {
  if (value == null) {
    reject(new Error(`${field} is null`))
  }
}