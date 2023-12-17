import {
    AcuityConstants,
    AcuityTypes,
    AfterSchoolEnrolment,
    ScheduleAfterSchoolEnrolmentParams,
    getApplicationDomain,
} from 'fizz-kidz'
import { DateTime } from 'luxon'

import { AcuityClient } from '../../acuity/core/acuity-client'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { StorageClient } from '../../firebase/StorageClient'
import { SheetsClient } from '../../google/SheetsClient'
import { HubspotClient } from '../../hubspot/HubspotClient'
import { projectId } from '../../init'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, throwTrpcError } from '../../utilities'

const env = projectId === 'bookings-prod' ? 'prod' : 'dev'

export default async function scheduleAfterSchoolProgram(
    input: ScheduleAfterSchoolEnrolmentParams,
    sendConfirmationEmail = true,
    sendPortalEmail = true
) {
    // create a firestore document
    const newDoc = (await FirestoreRefs.afterSchoolEnrolments()).doc()

    // get the calendar information from acuity
    const acuityClient = await AcuityClient.getInstance()
    const calendars = await acuityClient.getCalendars()
    const calendar = calendars.find((it) => it.id === input.calendarId)

    if (!calendar) {
        throwTrpcError('NOT_FOUND', `could not find matching calendar in acuity with id: ${input.calendarId}`)
    }

    // if an apaphylaxis plan was uploaded, move it into a directory under this booking
    // this will avoid files named the same thing from overwriting each other
    let anaphylaxisPlanUrl = ''
    if (input.child.anaphylaxisPlan) {
        try {
            const today = new Date()
            const storage = await StorageClient.getInstance()
            const bucket = storage.bucket(`${projectId}.appspot.com`)
            await bucket
                .file(`anaphylaxisPlans/${input.child.anaphylaxisPlan}`)
                .move(`anaphylaxisPlans/${newDoc.id}/${input.child.anaphylaxisPlan}`)
            anaphylaxisPlanUrl = (
                await bucket.file(`anaphylaxisPlans/${newDoc.id}/${input.child.anaphylaxisPlan}`).getSignedUrl({
                    version: 'v2',
                    action: 'read',
                    expires: new Date(today.setMonth(today.getMonth() + 6)), // expires in 6 months
                })
            )[0]
        } catch (err) {
            throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error enrolling', err, {
                context: `error moving anaphylaxis plan in storage for science enrolment with id: '${newDoc.id}'`,
            })
        }
    }

    // schedule into all appointments of the program, along with the document id
    let appointments: AcuityTypes.Api.Appointment[]
    try {
        const classes = await acuityClient.getClasses(input.appointmentTypeId, false, Date.now())
        appointments = await Promise.all(
            classes.map((it) =>
                acuityClient.scheduleAppointment({
                    appointmentTypeID: input.appointmentTypeId,
                    datetime: it.time,
                    firstName: input.parent.firstName,
                    lastName: input.parent.lastName,
                    email: input.parent.email,
                    phone: input.parent.phone,
                    fields: [{ id: AcuityConstants.FormFields.FIRESTORE_ID, value: newDoc.id }],
                })
            )
        )
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error enroling into the program', err, {
            context: `unable to book into acuity for science appointment`,
        })
    }

    // save all details, including all appointment ids, into firestore
    const appointment: AfterSchoolEnrolment = {
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
        child: {
            ...input.child,
            anaphylaxisPlan: anaphylaxisPlanUrl,
        },
    }

    await newDoc.set(appointment)

    // write anaphylactic kids to spreadsheet
    if (appointment.child.isAnaphylactic) {
        try {
            const sheetsClient = await SheetsClient.getInstance()
            await sheetsClient.addRowToSheet('anaphylacticChildrenChecklist', [
                [
                    appointment.className,
                    appointment.parent.firstName,
                    appointment.parent.lastName,
                    appointment.parent.phone,
                    appointment.child.firstName,
                    appointment.child.age,
                    appointment.child.allergies,
                    anaphylaxisPlanUrl,
                ],
            ])
        } catch (err) {
            logError(
                `error updating anaphylactic spreadsheet for science appointment with id: '${appointment.id}'`,
                err
            )
        }
    }

    try {
        const hubspotClient = await HubspotClient.getInstance()
        await hubspotClient.addScienceProgramContact({
            firstName: appointment.parent.firstName,
            lastName: appointment.parent.lastName,
            email: appointment.parent.email,
            mobile: appointment.parent.phone,
            calendarId: appointment.calendarId,
        })
    } catch (err) {
        logError(`unable to add science program enrolment to hubspot with id: ${appointment.id}`, err)
    }

    // send the confirmation email
    if (sendConfirmationEmail) {
        try {
            const mailClient = await MailClient.getInstance()
            await mailClient.sendEmail('scienceTermEnrolmentConfirmation', input.parent.email, {
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
            logError(
                `unable to send science enrolment confirmation email for enrolment with id: '${appointment.id}'`,
                err
            )
        }
    }

    if (sendPortalEmail) {
        try {
            const mailClient = await MailClient.getInstance()
            await mailClient.sendEmail('scienceParentPortalLink', input.parent.email, {
                parentName: input.parent.firstName,
                childName: input.child.firstName,
                className: input.className,
                portalUrl: `${getApplicationDomain(env)}/science-program-portal/${appointment.id}`,
            })
            appointment.emails.portalLinkEmailSent = true
            await newDoc.set(appointment, { merge: true })
        } catch (err) {
            logError(`unable to send science parent portal email for enrolment with id: '${appointment.id}'`, err)
        }
    }
}
