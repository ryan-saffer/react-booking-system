const functions = require('firebase-functions');
const stripeConstants = require("./constants/stripe")
const stripeConfig = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? stripeConstants.PROD_CONFIG : stripeConstants.DEV_CONFIG
const Acuity = require('acuityscheduling')
const acuityCredentials = require('../credentials/acuity_credentials.json')
const stripe = require('stripe')(stripeConfig.API_KEY)
const formFields = require('./constants/acuity')

var acuity = Acuity.basic({
  userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

// wrap all functions inside one handler, so coldstart will only occur for first invocation.
exports.acuityClient = functions.https.onCall((networkData, _context) => {
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

exports.sidebar = functions.https.onRequest((req, res) => {
  console.log("sidebar requested with body params:")
  console.log(req.body)

  acuity.request(`appointments/${req.body.id}`, (err, _resp, appointment) => {
    if (err) {
      res.status(err.status_code).send(err.message)
      return
    }

    const invoiceForm = appointment.forms.find(
      form => form.id === formFields.FORMS.INVOICE
    )
    if (invoiceForm === undefined) {
      // form doesn't include invoice, and is therefore not a science club
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const invoiceId = invoiceForm.values.find(
      field => field.fieldID === formFields.FORM_FIELDS.INVOICE_ID
    ).value

    const childDetailsForm = appointment.forms.find(
      form => form.id === formFields.FORMS.CHILD_DETAILS
    )
    if (childDetailsForm === undefined) {
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const childName = childDetailsForm.values.find(
      field => field.fieldID === formFields.FORM_FIELDS.CHILD_NAME
    ).value
    
    console.log(`Invoice form id: ${invoiceId}`)
    console.log(`Child name: ${childName}`)

    if (invoiceId === "") {
      const item = encodeURI(`${childName} - ${appointment.type}`)
      const phone = encodeURI(appointment.phone)
      return res.status(200).send(
      `
        <span class="label label-danger">Invoice not sent</span>
        <a href="${stripeConfig.SEND_INVOICE_ENDPOINT}/sendInvoice?email=${appointment.email}&name=${appointment.firstName}+${appointment.lastName}&phone=${phone}&appointmentId=${appointment.id}&appointmentTypeId=${appointment.appointmentTypeID}&item=${item}&childName=${childName}" class="primary-btn">Send invoice</a>
      `
      )
    } else {
      // invoice already created... check its status
      stripe.invoices.retrieve(
        invoiceId,
        (err, invoice) => {
          if (err) {
            console.log("error retrieving invoice")
            res.status(err.statusCode).send(err.message)
            return
          }
          if (invoice.paid) {
            return res.status(200).send(
              `
              <span class="label green">Invoice paid</span>
              <a href="${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}">View invoice</a>
              `
            )
          } else {
            return res.status(200).send(
              `
              <span class="label orange">Invoice not yet paid</span>
              <a href="${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}">View invoice</a>
              `
            )
          }
        }
      )
    }
  })
})

exports.sendInvoice = functions.https.onRequest((req, res) => {
  console.log("beggining function")
  console.log("query parameters:")
  console.log(req.query)

  const queryParams = {
    email: req.query.email,
    name: req.query.name,
    phone: req.query.phone,
    appointmentId: req.query.appointmentId,
    appointmentTypeId: req.query.appointmentTypeId,
    childName: req.query.childName,
    invoiceItem: req.query.item
  }

  for (let key in queryParams) {
    if (queryParams[key] === undefined) {
      return res.status(400).send(`${key} query parameter not supplied`)
    }  
  }

  // first search if customer with given email already exists
  stripe.customers.list(
    { email: queryParams.email },
    (err, customers) => {
      if (err) {
        console.log("error listing stripe customers")
        console.error(err)
        return res.status(err.statusCode).send(err.message)
      }

      if (customers.data.length > 0) {
        // customer exists!
        console.log("customer found in stripe")
        const customer = customers.data[0]
        createInvoiceItem(customer, queryParams, res)
      } else {
        // customer not found.. create a new one
        console.log("customer not found in stripe")
        createCustomer({ name, email, phone })
          .then(customer => {
            console.log("new customer succesfully created")
            createInvoiceItem(customer, queryParams, res)
          })
          .catch(err => {
            console.log("error creating customer in stripe")
            console.error(err)
            return resp.status(err.statusCode).send(err.message)
          })
      }
    }
  )
})

async function createCustomer(data) {
  console.log("creating new customer...")
  return await stripe.customers.create({ ...data })
}

function createInvoiceItem(customer, queryParams, res) {
  console.log("creating invoice item...")
  
  stripe.invoiceItems.create(
    { customer: customer.id, description: queryParams.invoiceItem, price: stripeConfig.PRICE_SCIENCE_CLUB },
    (err, invoiceItem) => {
      if (err) {
        console.log("error found while creating invoice item")
        console.error(err)
        return res.status(err.statusCode).send(err.message)
      }

      console.log("invoice item created succesfully")

      createInvoice(customer, invoiceItem.description)
        .then(invoice => {
          console.log("new invoice created succesfully")
          saveInvoiceToAcuity(invoice, queryParams)
            .then(_appointment => {
              console.log("invoice successfully saved in acuity")
              sendInvoice(invoice, res)
            })
            .catch(error => {
              console.log("error saving invoice in acuity")
              console.error(error)
              return res.status(error.status_code).send(error.message)
            })
        })
        .catch(error => {
          console.log("error creating invoice")
          console.error(error)
          return res.status(error.statusCode).send(error.message)
        })
    }
  )
}

async function createInvoice(customer, description) {
  console.log("creating invoice...")
  return await stripe.invoices.create(
    { customer: customer.id, description, collection_method: 'send_invoice', days_until_due: 30 }
  )
}

function saveInvoiceToAcuity(invoice, queryParams) {
  
  console.log("saving invoice into acuity...")

  return new Promise((resolve, reject) => {
    // first get every appointment of this child in this class
    // use child name, since a parent could have two children in a class
    // therefore appointmentTypeId and email is not enough
    acuity.request(
      `/appointments?email=${queryParams.email}&appointmentTypeID=${queryParams.appointmentTypeId}&field:${formFields.FORM_FIELDS.CHILD_NAME}=${queryParams.childName}`,
      async function (err, _resp, appointments) {
        if (err) reject(err)
        if (appointments.error) reject(appointments)

        // then update each one with the invoice id
        let promises = []
        console.log("updating all appointments for this client...")
        appointments.forEach(appointment => {
          promises.push(saveInvoiceIdToAppointment(invoice.id, appointment.id))
        })
        Promise.all(promises).then(appointments => {
          console.log("successfully updated all appointments")
          resolve(appointments)
        })
        .catch(error => reject(error))
      }
    )
  })
}

async function saveInvoiceIdToAppointment(invoiceId, appointmentId) {
  
  console.log(`updating single appointment: ${appointmentId}`)
  const options = {
    method: 'PUT',
    body: {
      fields: [
        {
          id: formFields.FORM_FIELDS.INVOICE_ID,
          value: invoiceId
        }
      ]
    }
  }

  return new Promise((resolve, reject) => {
    acuity.request(`/appointments/${appointmentId}`, options, (err, _acuityRes, appointment) => {
      if (err) reject(err)
      if (appointment.error) reject(appointment)
      resolve(appointment)
    })
  })
}

function sendInvoice(invoice, res) {
  
  console.log("sending invoice...")

  stripe.invoices.sendInvoice(
    invoice.id,
    (err, sentInvoice) => {
      if (err) {
        console.log("error sending invoice")
        console.log(err)
        return res.status(err.statusCode).send(err.message)
      }

      console.log("invoice sent successfully")
      return res.status(200).send(
      `
        <!DOCTYPE html>
        <html>
        <title>Invoice Sent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <body>

        <div class="w3-container w3-teal w3-center">
          <h1>Invoice successfully sent!</h1>
        </div>

        <div class="w3-container w3-center w3-text-blue">
          <p><a href="${stripeConfig.STRIPE_DASHBOARD}/invoices/${sentInvoice.id}" target="_blank">Click here to see the invoice in Stripe</a></p>
        </div>

        <div class="w3-container w3-center">
          <p>You can now close this window.</p>
        </div>

        </body>
        </html> 
      `
      )}  
  )
}