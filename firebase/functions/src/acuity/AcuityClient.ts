import { hasError } from './shared'
import { Acuity } from 'fizz-kidz'
import { ScheduleScienceAppointmentParams } from 'fizz-kidz/src'

const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

export class AcuityClient {
    private _request<T>(path: string, options: object = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            acuity.request(path, options, (err: any, _resp: any, appointment: T | Acuity.Error) => {
                if (hasError(err, appointment)) {
                    reject(err ?? appointment)
                    return
                }
                resolve(appointment)
                return
            })
        })
    }

    getAppointment(id: string) {
        return this._request<Acuity.Appointment>(`/appointments/${id}`)
    }

    scheduleAppointment(options: object) {
        return this._request<Acuity.Appointment>('/appointments', options)
    }

    getClasses(appointmentTypeId: number) {
        return this._request<Acuity.Class[]>(
            `/availability/classes?appointmentTypeID=${appointmentTypeId}&includeUnavailable=true`
        )
    }

    async scheduleScienceProgram(data: ScheduleScienceAppointmentParams, firestoreId: string): Promise<number[]> {
        // retrieve all appointments for appointmentType
        let classes = await this.getClasses(data.appointmentTypeId)

        // schedule into each appointment
        let promises: Promise<Acuity.Appointment>[] = []
        classes.forEach((klass) => {
            const options = {
                method: 'POST',
                body: {
                    appointmentTypeID: data.appointmentTypeId,
                    datetime: klass.time,
                    firstName: data.parentFirstName,
                    lastName: data.parentLastName,
                    email: data.parentEmail,
                    phone: data.parentPhone
                },
                fields: [{ id: Acuity.Constants.FormFields.FIRESTORE_ID, value: firestoreId }],
            }
            promises.push(this.scheduleAppointment(options))
        })

        let appointments = await Promise.all(promises)

        // return array of all ids of appointments
        return appointments.map(appointment => appointment.id)
    }
}
