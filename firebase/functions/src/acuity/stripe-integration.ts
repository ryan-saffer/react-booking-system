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

function isAcuityError(object: any | Acuity.Error): object is Acuity.Error {
    return (object as Acuity.Error).error !== undefined
}

type RetrieveInvoiceParams = {
  appointmentId: number
}

enum InvoiceStatus {
  NOT_SENT = "NOT_SENT",
  UNPAID = "UNPAID",
  PAID = "PAID",
  UNSUPPORTED = "UNSUPPORTED"
}

type InvoiceStatusResponse = {
  status: InvoiceStatus,
  url?: string
}

export const retrieveInvoiceStatus = functions
  .region('australia-southeast1')
  .https.onCall((data: RetrieveInvoiceParams, _context: functions.https.CallableContext): Promise<InvoiceStatusResponse> => {

    const appointmentId = data.appointmentId
        
    return new Promise((
      resolve: (status: InvoiceStatusResponse) => void,
      reject: (error: functions.https.HttpsError) => void
    ) => {
      acuity.request(`appointments/${appointmentId}`, (err: any, _resp: any, appointment: Acuity.Appointment | Acuity.Error) => {
        if (err) {
          console.log(`internal acuity error while fetching appointment with id: ${appointmentId}`)
          console.error(err)
          reject(new functions.https.HttpsError('internal', 'internal error while fetching appointment from acuity', err))
          return
        }
        if (isAcuityError(appointment)) {
          console.log(`error fetching appointment with id: ${appointmentId}`)
          console.error(appointment)
          reject(new functions.https.HttpsError('internal', `error while fetching appointment from acuity`, appointment))
          return
        }
    
        const invoiceForm = appointment.forms.find(
          form => form.id === formFields.FORMS.INVOICE
        )
        if (invoiceForm === undefined) {
          // form doesn't include invoice, and is therefore not a science club
          resolve({ status: InvoiceStatus.UNSUPPORTED })
          return
        }
        const invoiceId = invoiceForm.values.find(
            field => field.fieldID === formFields.FORM_FIELDS.INVOICE_ID
        )?.value ?? ""
    
        if (invoiceId === "") {
            resolve({ status: InvoiceStatus.NOT_SENT })
            return
        } else {
          // invoice already created... check its status
          stripe.invoices.retrieve(invoiceId)
            .then(invoice => {
              const url = `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`
              if (invoice.paid) {
                resolve({ status: InvoiceStatus.PAID, url })
                return
              } else {
                resolve({ status: InvoiceStatus.UNPAID, url })
                return
              }
            })
            .catch(error => {
              console.log('error retrieving invoice')
              console.error(error)
              reject(new functions.https.HttpsError('internal', 'error retreiving invoice from stripe', error))
              return
            })
        }
      })
    })
  })

type SendInvoiceParams = {
  email: string,
  name: string,
  phone: string,
  childName: string
  invoiceItem: string,
  appointmentTypeId: number,
  [key: string]: any
}

type SendInvoiceResolve = (status: InvoiceStatusResponse) => void
type SendInvoiceReject = (error: functions.https.HttpsError) => void

export const sendInvoice = functions
  .region('australia-southeast1')
  .https.onCall((data: SendInvoiceParams, _context: functions.https.CallableContext): Promise<InvoiceStatusResponse> => {
    
    console.log("beggining function")
    console.log("query parameters:")
    console.log(data)

    return new Promise<InvoiceStatusResponse>((
      resolve: SendInvoiceResolve,
      reject: SendInvoiceReject
    ) => {

      for (const key in data) {
        if (data[key] === undefined) {
          reject(new functions.https.HttpsError('invalid-argument', `${key} value not supplied`))
          return
        }
      }

    // first search if customer with given email already exists
      stripe.customers.list({ email: data.email })
        .then(customers => {
          if (customers.data.length > 0) {
            // customer exists!
            console.log("customer found in stripe")
            const customer = customers.data[0]
            createInvoiceItem(customer, data, resolve, reject)
          } else {
            // customer not found.. create a new one
            console.log("customer not found in stripe")
            console.log("creating new customer")
            stripe.customers.create({ name: data.name, email: data.email, phone: data.phone })
              .then(customer => {
                console.log("new customer succesfully created")
                createInvoiceItem(customer, data, resolve, reject)
              })
              .catch(err => {
                console.log("error creating customer in stripe")
                console.error(err)
                reject(new functions.https.HttpsError('internal', 'error creationg customer in stripe', err))
                return
              })
          }
        })
        .catch(err => {
          console.log("error listing stripe customers")
          console.error(err)
          reject(new functions.https.HttpsError('internal', 'error listing stripe customers', err))
          return
        })
    })
})

function createInvoiceItem(
  customer: Stripe.Customer,
  data: SendInvoiceParams,
  resolve: SendInvoiceResolve,
  reject: SendInvoiceReject
) {
  console.log("creating invoice item...")

  const params: Stripe.InvoiceItemCreateParams = {
    customer: customer.id,
    description: data.invoiceItem,
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
          saveInvoiceToAcuity(invoice, data)
            .then(appointments => {
              if (appointments.length <= 0) {
                console.log("No appointments found matching email, childName and appointmentTypeId")
                console.log("Invoice created but not sent")
                reject(new functions.https.HttpsError(
                  'not-found',
                  'invoice created, but no appointments found matching email, childName and appointmentTypeId, so invoice not sent',
                ))
                return
              } else {
                console.log("invoice successfully saved in acuity")
                emailInvoice(invoice, resolve, reject)
              }
            })
            .catch(error => {
              console.log("error saving invoice in acuity")
              console.error(error)
              reject(new functions.https.HttpsError('internal', 'error saving invoice in acuity', error))
              return
            })
        })
        .catch(error => {
          console.log("error creating invoice")
          console.error(error)
          reject(new functions.https.HttpsError('internal', 'error creating invoice', error))
          return
        })
    })
    .catch(err => {
      console.log("error found while creating invoice item")
      console.error(err)
      reject(new functions.https.HttpsError('internal', 'error found while creationg invoice item', err))
      return
    })
}

function saveInvoiceToAcuity(invoice: Stripe.Invoice, queryParams: SendInvoiceParams) {
  
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
        if (isAcuityError(appointments)) {
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
      if (isAcuityError(appointment)) {
        reject(appointment)
        return
      }
      resolve(appointment)
    })
  })
}

function emailInvoice(invoice: Stripe.Invoice, resolve: SendInvoiceResolve, reject: SendInvoiceReject) {
    
  console.log("sending invoice...")

  stripe.invoices.sendInvoice(invoice.id)
    .then(sentInvoice => {
      console.log("invoice sent successfully")
      resolve({ status: InvoiceStatus.UNPAID, url: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${sentInvoice.id}` })
      return
    })
    .catch(err => {
      console.log("error sending invoice")
      console.log(err)
      reject(new functions.https.HttpsError('internal', 'error sending invoicing in stripe', err))
      return
    })
}