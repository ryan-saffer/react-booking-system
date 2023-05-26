import * as functions from 'firebase-functions'
import { ScheduleScienceAppointmentParams, Acuity, ScienceEnrolment } from 'fizz-kidz'
import { db, storage } from '../../init'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { getMailClient } from '../../sendgrid/MailClient'
import { DateTime } from 'luxon'

const projectName = JSON.parse(process.env.FIREBASE_CONFIG).projectId
const env = projectName === 'bookings-prod' ? 'prod' : 'dev'

export default async function scheduleScienceProgram(
    input: ScheduleScienceAppointmentParams,
    sendConfirmationEmail = true,
    sendPortalEmail = true
) {
    try {
        // create a firestore document
        const newDoc = db.collection('scienceAppointments').doc()

        // get the calendar information from acuity
        const calendars = await AcuityClient.getCalendars()
        const calendar = calendars.find((it) => it.id === input.calendarId)

        if (!calendar) {
            throw new functions.https.HttpsError(
                'aborted',
                `could not find matching calendar in acuity with id: ${input.calendarId}`
            )
        }

        // if an apaphylaxis plan was uploaded, move it into a directory under this booking
        // this will avoid files named the same thing from overwriting each other
        if (input.child.anaphylaxisPlan) {
            try {
                await storage
                    .bucket(`${projectName}.appspot.com`)
                    .file(`anaphylaxisPlans/${input.child.anaphylaxisPlan}`)
                    .move(`anaphylaxisPlans/${newDoc.id}/${input.child.anaphylaxisPlan}`)
            } catch (err) {
                functions.logger.error('error moving anaphylaxis plan', input, err)
                throw new functions.https.HttpsError('internal', 'error moving anaphylaxis plan', err)
            }
        }

        // schedule into all appointments of the program, along with the document id
        const classes = await AcuityClient.getClasses(input.appointmentTypeId, false, Date.now())
        const appointments = await Promise.all(
            classes.map((it) =>
                AcuityClient.scheduleAppointment({
                    appointmentTypeID: input.appointmentTypeId,
                    datetime: it.time,
                    firstName: input.parent.firstName,
                    lastName: input.parent.lastName,
                    email: input.parent.email,
                    phone: input.parent.phone,
                    fields: [{ id: Acuity.Constants.FormFields.FIRESTORE_ID, value: newDoc.id }],
                })
            )
        )

        // save all details, including all appointment ids, into firestore
        const appointment: ScienceEnrolment = {
            ...input,
            id: newDoc.id,
            appointments: appointments.map((it) => it.id),
            price: appointments[0].price,
            status: 'active',
            continuingWithTerm: '',
            invoiceId: '',
            notes: '',
            emails: {
                continuingEmailSent: false,
                portalLinkEmailSent: false,
            },
            signatures: appointments.reduce((accumulator, value) => ({ ...accumulator, [value.id]: '' }), {}),
        }

        await newDoc.set(appointment)

        // send the confirmation email
        if (sendConfirmationEmail) {
            try {
                await getMailClient().sendEmail('scienceTermEnrolmentConfirmation', input.parent.email, {
                    parentName: input.parent.firstName,
                    childName: input.child.firstName,
                    className: input.className,
                    appointmentTimes: appointments.map((it) =>
                        DateTime.fromISO(it.datetime, {
                            setZone: true,
                        }).toLocaleString({
                            weekday: 'short',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })
                    ),
                    calendarName: calendar.location,
                    price: (parseInt(appointments[0].price) * appointments.length).toString(),
                    location: calendar.description,
                    numberOfWeeks: appointments.length.toString(),
                })
            } catch (err) {
                functions.logger.error(err)
                throw new functions.https.HttpsError(
                    'ok',
                    'error sending confirmation email after successfull booking',
                    err
                )
            }
        } else {
            console.log('Skipping confirmation email')
        }

        if (sendPortalEmail) {
            try {
                const baseUrl = env === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://dev.fizzkidz.com.au'
                await getMailClient().sendEmail('scienceParentPortalLink', input.parent.email, {
                    parentName: input.parent.firstName,
                    childName: input.child.firstName,
                    className: input.className,
                    portalUrl: `${baseUrl}/science-program-portal/${appointment.id}`,
                })
                appointment.emails.portalLinkEmailSent = true
                await newDoc.set(appointment, { merge: true })
            } catch (err) {
                functions.logger.error(err)
                throw new functions.https.HttpsError('ok', 'error sending portal email after successfull booking', err)
            }
        }
    } catch (err) {
        functions.logger.error(err)
        throw new functions.https.HttpsError('internal', 'error schedulding into science program', err)
    }
}
