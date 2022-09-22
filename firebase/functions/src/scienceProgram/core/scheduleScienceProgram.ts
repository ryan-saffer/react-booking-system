import * as functions from 'firebase-functions'
import { ScheduleScienceAppointmentParams, ScienceAppointment } from 'fizz-kidz'
import { db, storage } from '../../init'
import { AcuityClient } from '../../acuity/AcuityClient'
import { MailClient } from '../../sendgrid/MailClient'
import { DateTime } from 'luxon'

const projectName = JSON.parse(process.env.FIREBASE_CONFIG).projectId

export default async function scheduleScienceProgram(
    input: ScheduleScienceAppointmentParams,
    sendEmail: boolean = true
) {
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
        if (sendEmail) {
            try {
                await new MailClient().sendEmail('scienceTermEnrolmentConfirmation', input.parentEmail, {
                    parentName: input.parentFirstName,
                    childName: input.childFirstName,
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
                })
            } catch (err) {
                throw new functions.https.HttpsError(
                    'ok',
                    'error sending confirmation email after successfull booking',
                    err
                )
            }
        } else {
            console.log("Skipping confirmation email")
        }
    } catch (err) {
        throw new functions.https.HttpsError('internal', 'error schedulding into science program', err)
    }
}
