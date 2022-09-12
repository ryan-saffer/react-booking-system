import { hasError } from './shared'
import { Acuity, ScheduleScienceAppointmentParams } from 'fizz-kidz'

const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

export class AcuityClient {
    private _request<T>(path: string, options: object = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            acuity.request(path, options, (err: any, _resp: any, result: T | Acuity.Error) => {
                if (hasError(err, result)) {
                    reject(err ?? result)
                    return
                }
                resolve(result)
                return
            })
        })
    }

    getAppointment(id: string) {
        return this._request<Acuity.Appointment>(`/appointments/${id}`)
    }

    getAppointmentTypes() {
        return this._request<Acuity.AppointmentType[]>(`/appointment-types`)
    }

    scheduleAppointment(options: object) {
        return this._request<Acuity.Appointment>('/appointments', options)
    }

    cancelAppointment(id: number) {
        return this._request(`/appointments/${id}/cancel?admin=true`, { method: 'PUT' })
    }

    getClasses(appointmentTypeId: number, minDate?: number) {
        let path = `/availability/classes?appointmentTypeID=${appointmentTypeId}&includeUnavailable=true`
        if (minDate) {
            path += `&minDate=${encodeURIComponent(new Date(minDate).toISOString())}`
        }
        return this._request<Acuity.Class[]>(path)
    }

    async scheduleScienceProgram(data: ScheduleScienceAppointmentParams, firestoreId: string) {
        // retrieve all appointments for appointmentType
        const classes = await this.getClasses(data.appointmentTypeId, Date.now())

        // schedule into each appointment
        const appointments = await Promise.all(
            classes.map((klass) => {
                const options = {
                    method: 'POST',
                    body: {
                        appointmentTypeID: data.appointmentTypeId,
                        datetime: klass.time,
                        firstName: data.parentFirstName,
                        lastName: data.parentLastName,
                        email: data.parentEmail,
                        phone: data.parentPhone,
                        fields: [{ id: Acuity.Constants.FormFields.FIRESTORE_ID, value: firestoreId }],
                    },
                }
                return this.scheduleAppointment(options)
            })
        )

        // return array of all ids of appointments, along with price
        return {
            appointments: appointments.map((appointment) => appointment.id),
            price: appointments[0].price,
        }
    }

    async unenrollChildFromTerm(ids: number[]) {
        await Promise.all(ids.map((id) => this.cancelAppointment(id)))
    }
}
