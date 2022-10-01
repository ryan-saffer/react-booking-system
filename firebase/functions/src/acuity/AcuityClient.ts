import { hasError } from './shared'
import { Acuity } from 'fizz-kidz'

const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

type ScheduleAppointmentParams = {
    appointmentTypeID: number
    datetime: string
    firstName: string
    lastName: string
    email: string
    phone: string
    fields?: { id: number; value: number | string }[]
}

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

    updateAppointment(params: Acuity.Client.UpdateAppointmentParams) {
        const { id, ...body } = params
        return this._request<Acuity.Appointment>(`/appointments/${id}`, { method: 'PUT', body })
    }

    getAppointments(ids: number[]) {
        return Promise.all(ids.map((id) => this.getAppointment(id.toString())))
    }

    searchForAppointments(params: Acuity.Client.FetchAppointmentsParams) {
        let path = `/appointments?calendarID=${params.calendarId}&appointmenTypeID=${params.appointmentTypeId}`
        if (params.classTime) {
            const date = params.classTime.split('T')[0]
            path += `&minDate=${date}&maxDate=${date}`
        }
        return this._request<Acuity.Appointment[]>(path)
    }

    getAppointmentTypes() {
        return this._request<Acuity.AppointmentType[]>(`/appointment-types`)
    }

    scheduleAppointment(body: ScheduleAppointmentParams) {
        return this._request<Acuity.Appointment>('/appointments', { method: 'POST', body })
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

    getCalendars() {
        return this._request<Acuity.Calendar[]>(`/calendars`)
    }
}
