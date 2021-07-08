import { Acuity, AppsScript } from 'fizz-kidz';
import * as functions from 'firebase-functions'
import { runAppsScript } from '../bookings';

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? "prod" : "dev"

export const sendScienceClubContinuationEmail = functions
    .region('australia-southeast1')
    .https
    .onCall(async (appointment: Acuity.Appointment, _context: functions.https.CallableContext) => {

        const childName = Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)
        const baseQueryParams = `?appointmentTypeId=${appointment.appointmentTypeID}&email=${appointment.email}&childName=${childName}`
        const continueQueryParams = baseQueryParams + `&continuing=yes`
        const unenrollQueryParams = baseQueryParams + `&continuing=no`

        const encodedContinueQueryParams = Buffer.from(continueQueryParams).toString('base64')
        const encodedUnenrollQueryParams = Buffer.from(unenrollQueryParams).toString('base64')

        let baseUrl = env === "prod" ? "https://bookings.fizzkidz.com.au" : "https://booking-system-6435d.web.app"
        baseUrl += '/science-club-enrolment'

        const appsScriptAppointment = {
            parentName: appointment.firstName,
            email: appointment.email,
            className: appointment.type,
            childName: childName,
            continueUrl: `${baseUrl}?${encodedContinueQueryParams}`,
            unenrollUrl: `${baseUrl}?${encodedUnenrollQueryParams}`
        }

        try {
            console.log('running apps script to send continuation email')
            await runAppsScript(AppsScript.Functions.SEND_TERM_CONTINUATION_EMAIL, [appsScriptAppointment])
            console.log('finished apps script successfully')
            return
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'error running apps script', error)
        }
    })