import * as functions from 'firebase-functions'
import { Acuity } from 'fizz-kidz'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../../../credentials/acuity_credentials.json')
import { hasError } from '../../shared'

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

type AcuityClientParams = { method: keyof Acuity.Client.AcuityFunctions, input: any }

export const client = functions
    .region('australia-southeast1')
    .https.onCall((data: AcuityClientParams, _context: functions.https.CallableContext) => {

        let input
        switch (data.method) {
            case 'updateEnrolment':
                input = data.input as Acuity.Client.AcuityFunctions['updateEnrolment']['input']
                return updateEnrolment(input)
            case 'unenrollChildFromTerm':
                input = data.input as Acuity.Client.AcuityFunctions['unenrollChildFromTerm']['input']
                return unenrollChildFromTerm(input)
        }
    })

async function updateEnrolment(input: Acuity.Client.AcuityFunctions['updateEnrolment']['input']): Promise<Acuity.Appointment[]> {

    try {
        return await updateAllScienceAppointmentsForChild(input)
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'error updating all science club appointments', error)
    }
}

function updateAllScienceAppointmentsForChild(params: Acuity.Client.UpdateScienceEnrolmentParams) {

    const {
        email,
        appointmentTypeId,
        childName,
        fieldId,
        value
    } = params

    return new Promise<Acuity.Appointment[]>((resolve, reject) => {

        // first get every appointment of this child in this class
        // use child name, since a parent could have two children in a class
        // therefore appointmentTypeId and email is not enough
        acuity.request(
            `/appointments?email=${email}&appointmentTypeID=${appointmentTypeId}&field:${Acuity.Constants.FormFields.CHILD_NAME}=${childName}`,
            function (err: any, _resp: any, appointments: Acuity.Appointment[] | Acuity.Error) {

                if (hasError(err, appointments)) {
                    reject(err ?? appointments)
                    return
                }

                if (appointments.length <= 0) {
                    console.error('no appointments found matching params:', email, appointmentTypeId, childName)
                    reject('no appointments found matching params')
                    return
                }


                // then update each one with the invoice id
                const promises: Promise<Acuity.Appointment>[] = []
                console.log("updating all science club appointments for this client...")
                appointments.forEach(appointment => {
                    promises.push(updateAppointmentFormField(appointment.id, fieldId, value))
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

function updateAppointmentFormField(appointmentId: number, fieldId: number, value: string) {

    console.log(`updating single appointment: ${appointmentId}`)
    const options = {
        method: 'PUT',
        body: {
            fields: [{
                id: fieldId,
                value: value
            }]
        }
    }

    return new Promise<Acuity.Appointment>((resolve, reject) => {
        acuity.request(`/appointments/${appointmentId}`, options, (err: any, _acuityRes: any, appointment: Acuity.Appointment | Acuity.Error) => {

            if (hasError(err, appointment)) {
                reject(err ?? appointment)
                return
            }

            resolve(appointment)
        })
    })
}

function unenrollChildFromTerm(params: Acuity.Client.UnenrollChildFromTermParams) {

    const options = {
        method: 'PUT'
    }

    return new Promise<Acuity.Appointment>((resolve, reject) => {
        acuity.request(`/appointments/${params.appointmentId}/cancel`, options, (err: any, _acuityRes: any, appointment: Acuity.Appointment | Acuity.Error) => {

            if (hasError(err, appointment)) {
                reject(err ?? appointment)
                return
            }

            resolve(appointment)
        })
    })
}





