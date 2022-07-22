const functions = require('firebase-functions');
const Acuity = require('acuityscheduling')
const acuityCredentials = require('../../../../credentials/acuity_credentials.json');

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
        case 'updateEnrolment':
          updateEnrolment(data, resolve, reject)
          break;
        case 'updateLabel':
          updateLabel(data, resolve, reject)
          break
        case 'markPaid':
          markPaid(data, resolve, reject)
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
    handleResult(err, appointmentTypes, resolve, reject)
  })
}

function getCalendars(resolve, reject) {
  acuity.request('calendars', (err, _resp, calendars) => {
    handleResult(err, calendars, resolve, reject)
  })
}

function getClasses(data, resolve, reject) {
  sanitise("appointmentTypeID", data.id, reject)
  acuity.request(`/availability/classes?appointmentTypeID=${data.id}&includeUnavailable=true`, (err, _resp, classes) => {
    handleResult(err, classes, resolve, reject)
  })
}

function getAppointments(data, resolve, reject) {
  sanitise("appointmentTypeID", data.appointmentTypeID, reject)
  sanitise("calendarID", data.calendarID, reject)
  acuity.request(
    `/appointments?appointmentTypeID=${data.appointmentTypeID}&calendarID=${data.calendarID}&max=500`,
    (err, _resp, appointments) => {
      handleResult(err, appointments, resolve, reject)
  })
}

function updateEnrolment(data, resolve, reject) {
  sanitise("appointmentId", data.appointmentId, reject)
  sanitise("continuing", data.continuing, reject)
  acuity.request(
    `/appointments/${data.appointmentId}`,
    (err, _resp, appointment) => {
      handleResult(err, appointment, resolve, reject)
    }
  )
}

function updateLabel(data, resolve, reject) {
  sanitise("clientId", data.clientId, reject)
  sanitise("label", data.label ?? "", reject)

  var options = {
    method: 'PUT',
    body: {
      labels: [
        { id: data.label }
      ]
    }
  }

  acuity.request(`/appointments/${data.clientId}`, options, (err, _resp, appointment) => {
    handleResult(err, appointment, resolve, reject)
  })
}

function markPaid(data, resolve, reject) {
  sanitise('appointmentId', data.appointmentId, reject)
  sanitise('amount', data.amount, reject)

  const options = {
    method: 'POST',
    body: {
      "source": {
        "type": "cash"
      },
      "amount": data.amount,
      "notes": "Payment recorded on Fizz Kidz app"
    }
  }

  acuity.request(`/appointments/${data.appointmentId}/payments`, options, (err, _resp, appointment) => {
    handleResult(err, appointment, resolve, reject)
  })
}

// not used yet
function getLabels(resolve, reject) {
  acuity.request("labels", (err, _resp, labels) => {
    handleResult(err, labels, resolve, reject)
  })
}

function sanitise(field, value, reject) {
  if (value == null) {
    reject(new Error(`${field} is null`))
  }
}

function handleResult(err, result, resolve, reject) {
  if (err) {
    reject(err)
  } else if (result.error) {
    reject(result)
  } else {
    resolve(result)
  }
}