import * as functions from 'firebase-functions'
import * as stripeConstants from '../constants/stripe'
const stripeConfig = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? stripeConstants.PROD_CONFIG : stripeConstants.DEV_CONFIG
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
import Stripe from 'stripe'
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: "2020-03-02" // https://stripe.com/docs/api/versioning
})
import * as formFields from '../constants/acuity'
import * as Acuity from '../../types/acuity'

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

function isError(object: any | Acuity.Error): object is Acuity.Error {
    return (object as Acuity.Error).error !== undefined
}

export const sidebar = functions
  .region('australia-southeast1')
  .https.onRequest((req: functions.Request, res: functions.Response) => {
    
  console.log("sidebar requested with body params:")
  console.log(req.body)

  acuity.request(`appointments/${req.body.id}`, (err: any, _resp: any, appointment: Acuity.Appointment | Acuity.Error) => {
    if (err) {
      console.log(`internal acuity error while fetching appointment with id: ${req.body.id}`)
      console.error(err)
      return res.status(500).send(err)
    }
    if (isError(appointment)) {
      console.log(`error fetching appointment with id: ${req.body.id}`)
      console.error(appointment)
      return res.status(appointment.status_code).send(appointment.message)
    }

    const invoiceForm = appointment.forms.find(
      form => form.id === formFields.FORMS.INVOICE
    )
    if (invoiceForm === undefined) {
      // form doesn't include invoice, and is therefore not a science club
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const invoiceIdFormValue = invoiceForm.values.find(
        field => field.fieldID === formFields.FORM_FIELDS.INVOICE_ID
    )
    if (invoiceIdFormValue === undefined) {
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const invoiceId = invoiceIdFormValue.value

    const childDetailsForm = appointment.forms.find(
        form => form.id === formFields.FORMS.CHILD_DETAILS
    )
    if (childDetailsForm === undefined) {
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const childNameFormValue = childDetailsForm.values.find(
        field => field.fieldID === formFields.FORM_FIELDS.CHILD_NAME
    )
    if (childNameFormValue === undefined) {
      return res.status(200).send("<p>This class does not support invoices</p>")
    }
    const childName = childNameFormValue.value
      
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
      stripe.invoices.retrieve(invoiceId)
        .then(invoice => {
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
        })
        .catch(error => {
          console.log('error retrieving invoice')
          console.error(error)
          return res.status(500).send(error)
        })
    }
  })
})

type QueryParams = {
  email: string,
  name: string,
  phone: string,
  childName: string
  invoiceItem: string,
  appointmentTypeId: string,
  [key: string]: string
}

export const sendInvoice = functions
  .region('australia-southeast1')
  .https.onRequest((req: functions.Request, res: functions.Response) => {
    
  console.log("beggining function")
  console.log("query parameters:")
  console.log(req.query)

  const queryParams: QueryParams = {
    email: req.query.email as string,
    name: req.query.name as string,
    phone: req.query.phone as string,
    appointmentTypeId: req.query.appointmentTypeId as string,
    childName: req.query.childName as string,
    invoiceItem: req.query.item as string
  }

  for (const key in queryParams) {
    if (queryParams[key] === undefined) {
      res.status(400).send(`${key} query parameter not supplied`)
      return
    }
  }

  // first search if customer with given email already exists
  stripe.customers.list({ email: queryParams.email })
    .then(customers => {
      if (customers.data.length > 0) {
        // customer exists!
        console.log("customer found in stripe")
        const customer = customers.data[0]
        createInvoiceItem(customer, queryParams, res)
      } else {
        // customer not found.. create a new one
        console.log("customer not found in stripe")
        console.log("creating new customer")
        stripe.customers.create({ name, email: queryParams.email, phone: queryParams.phone })
          .then(customer => {
            console.log("new customer succesfully created")
            createInvoiceItem(customer, queryParams, res)
          })
          .catch(err => {
            console.log("error creating customer in stripe")
            console.error(err)
            return res.status(err.statusCode).send(err.message)
          })
      }
    })
    .catch(err => {
      console.log("error listing stripe customers")
      console.error(err)
      return res.status(err.statusCode).send(err.message)
    })
})

function createInvoiceItem(customer: Stripe.Customer, queryParams: QueryParams, res: functions.Response<any>) {
  console.log("creating invoice item...")

  const params: Stripe.InvoiceItemCreateParams = {
    customer: customer.id,
    description: queryParams.invoiceItem,
    price: stripeConfig.STRIPE_PRICE_SCIENCE_CLUB
  }
  stripe.invoiceItems.create(params)
    .then(invoiceItem => {
      console.log("invoice item created succesfully")
      console.log("creating invoice...")
      stripe.invoices.create({
        customer: customer.id,
        description: invoiceItem.description ?? undefined,
        collection_method: 'send_invoice',
        days_until_due: 30
      })
        .then(invoice => {
          console.log("new invoice created succesfully")
          saveInvoiceToAcuity(invoice, queryParams)
            .then(appointments => {
              if (appointments.length <= 0) {
                console.log("No appointments found matching email, childName and appointmentTypeId")
                console.log("Invoice created but not sent")
                return res.status(200).send(
                  `
                  <!DOCTYPE html>
                  <html>
                  <title>Invoice Created</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
                  <body>

                  <div class="w3-container w3-orange w3-center">
                  <h1>Invoice created, but not sent</h1>
                  </div>

                  <div class="w3-container w3-center">
                  <p>There was a problem with sending the invoice.</p>
                  <p>The invoice was created, but could not be saved back into Acuity.</p>
                  </div>

                  <div class="w3-container w3-center w3-text-blue">
                  <p><a href="${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}" target="_blank">Click here to see the invoice in Stripe</a></p>
                  </div>

                  <div class="w3-container w3-center">
                  <p>Screenshot this and show Ryan, and save the invoice link above.</p>
                  </div>

                  </body>
                  </html> 
                  `
                )
              } else {
                console.log("invoice successfully saved in acuity")
                emailInvoice(invoice, res)
              }
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
    })
    .catch(err => {
      console.log("error found while creating invoice item")
      console.error(err)
      return res.status(err.statusCode).send(err.message)
    })
}

function saveInvoiceToAcuity(invoice: Stripe.Invoice, queryParams: QueryParams) {
  
  console.log("saving invoice into acuity...")

  return new Promise<Acuity.Appointment[]>((resolve, reject) => {
    // first get every appointment of this child in this class
    // use child name, since a parent could have two children in a class
    // therefore appointmentTypeId and email is not enough
    acuity.request(
      `/appointments?email=${queryParams.email}&appointmentTypeID=${queryParams.appointmentTypeId}&field:${formFields.FORM_FIELDS.CHILD_NAME}=${queryParams.childName}`,
      function (err: any, _resp: any, appointments: Acuity.Appointment[] | Acuity.Error) {
        if (err) {
          reject(err)
          return
        }
        if (isError(appointments)) {
          reject(appointments)
          return
        }
        
        if (appointments.length <= 0) {
          resolve(appointments)
          return
        }

        // then update each one with the invoice id
        const promises: Promise<Acuity.Appointment>[] = []
        console.log("updating all appointments for this client...")
        appointments.forEach(appointment => {
          promises.push(saveInvoiceIdToAppointment(invoice.id, appointment.id))
        })
        Promise.all(promises)
          .then(result => {
            console.log("successfully updated all appointments")
            resolve(result)
          })
          .catch(error => reject(error))
      }
    )
  })
}

function saveInvoiceIdToAppointment(invoiceId: string, appointmentId: number) {
  
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

  return new Promise<Acuity.Appointment>((resolve, reject) => {
    acuity.request(`/appointments/${appointmentId}`, options, (err: any, _acuityRes: any, appointment: Acuity.Appointment | Acuity.Error) => {
      if (err) {
        reject(err)
        return
      }
      if (isError(appointment)) {
        reject(appointment)
        return
      }
      resolve(appointment)
    })
  })
}

function emailInvoice(invoice: Stripe.Invoice, res: functions.Response<any>) {
    
  console.log("sending invoice...")

  stripe.invoices.sendInvoice(invoice.id)
    .then(sentInvoice => {
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
      )
    })
    .catch(err => {
      console.log("error sending invoice")
      console.log(err)
      return res.status(err.statusCode).send(err.message)
    })
}