import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/AcuityClient'
import { onCall } from '../../utilities'
import { db, storage } from '../../init'
import { ScheduleScienceAppointmentParams, ScienceAppointment } from 'fizz-kidz'
import { MailClient } from '../../sendgrid/EmailClient'
import { EmailInfo, Emails } from '../../sendgrid/types'
import { DateTime } from 'luxon'

const projectName = JSON.parse(process.env.FIREBASE_CONFIG).projectId

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams, _context: functions.https.CallableContext) => {
        try {
            // create a firestore document
            const newDoc = db.collection('scienceAppointments').doc()

            // get the calendar information from acuity
            const acuityClient = new AcuityClient()
            const calendars = await acuityClient.getCalendars()
            const calendar = calendars.find((it) => it.id === input.calendarId)

            if (!calendar) {
                throw new functions.https.HttpsError(
                    'aborted',
                    `could not find matching calendar in acuity with id: ${input.calendarId}`
                )
            }

            // if an apaphylaxis plan was uploaded, move it into a directory under this booking
            // this will avoid files named the same thing from overwriting each other
            if (input.anaphylaxisPlan) {
                try {
                    await storage
                        .bucket(`${projectName}.appspot.com`)
                        .file(`anaphylaxisPlans/${input.anaphylaxisPlan}`)
                        .move(`anaphylaxisPlans/${newDoc.id}/${input.anaphylaxisPlan}`)
                } catch (err) {
                    throw new functions.https.HttpsError('internal', 'error moving anaphylaxis plan', err)
                }
            }

            // schedule into all appointments of the program, along with the document id
            const appointments = await acuityClient.scheduleScienceProgram(input, newDoc.id)

            // save all details, including all appointment ids, into firestore
            let appointment: ScienceAppointment = {
                ...input,
                id: newDoc.id,
                appointments: appointments.map((it) => it.id),
                price: appointments[0].price,
                status: 'active',
                continuingWithTerm: '',
                continuingEmailSent: false,
                invoiceId: '',
                notes: '',
            }

            await newDoc.set({ ...appointment })

            // send the confirmation email
            const emailInfo: EmailInfo = {
                to: input.parentEmail,
                from: {
                    name: 'Fizz Kidz',
                    email: 'bookings@fizzkidz.com.au',
                },
                subject: 'Science Program Booking Confirmation',
            }
            const emailValues: Emails['scienceTermEnrolmentConfirmation'] = {
                templateName: 'science_term_enrolment_confirmation.html',
                values: {
                    parentName: input.parentFirstName,
                    childName: input.childName,
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
                    price: appointments[0].price,
                    location: calendar.description,
                    numberOfWeeks: appointments.length.toString(),
                },
            }
            
            try {
                const mailClient = new MailClient()
                await mailClient.sendEmail(emailInfo, emailValues)
            } catch (err) {
                throw new functions.https.HttpsError(
                    'ok',
                    'error sending confirmation email after successfull booking',
                    err
                )
            }
        } catch (err) {
            throw new functions.https.HttpsError('internal', 'error schedulding into science program', err)
        }
    }
)
