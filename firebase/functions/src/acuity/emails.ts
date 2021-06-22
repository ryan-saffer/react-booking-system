import { Acuity, AppsScript } from 'fizz-kidz';
import * as functions from 'firebase-functions'
import { runAppsScript } from '../bookings';

export const sendScienceClubContinuationEmail = functions
    .region('australia-southeast1')
    .https
    .onCall(async (appointment: Acuity.Appointment, _context: functions.https.CallableContext) => {

        let appsScriptAppointment = {
            parentName: appointment.firstName,
            email: appointment.email,
            type: appointment.type,
            childName: Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)
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