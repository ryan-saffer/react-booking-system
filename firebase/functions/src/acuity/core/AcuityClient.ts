import { hasError } from './utilities'
import { Acuity } from 'fizz-kidz'
import UpdateAppointmentParams = Acuity.Client.UpdateAppointmentParams
import FetchAppointmentsParams = Acuity.Client.FetchAppointmentsParams
import GetAppointmentTypesParams = Acuity.Client.GetAppointmentTypesParams
import UpdateLabelParams = Acuity.Client.UpdateLabelParams
import Label = Acuity.Client.Label
import acuityCredentials from '../../../credentials/acuity_credentials.json'

type ScheduleAppointmentParams = {
    appointmentTypeID: number
    datetime: string
    firstName: string
    lastName: string
    email: string
    phone: string
    calendarID?: number
    paid?: boolean
    certificate?: string
    fields?: { id: number; value: number | string }[]
}

class Client {
    #client: any

    get #acuity() {
        if (this.#client) return this.#client
        throw new Error('Acuity client not initialised')
    }

    async _initialise() {
        const acuity = await import('acuityscheduling')
        this.#client = acuity.basic({
            userId: acuityCredentials.user_id,
            apiKey: acuityCredentials.api_key,
        })
    }

    private _request<T>(path: string, options: Record<string, unknown> = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            this.#acuity.request(path, options, (err: any, _resp: any, result: T | Acuity.Error) => {
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

    updateAppointment(params: UpdateAppointmentParams) {
        const { id, ...body } = params
        return this._request<Acuity.Appointment>(`/appointments/${id}`, { method: 'PUT', body })
    }

    getAppointments(ids: number[]) {
        return Promise.all(ids.map((id) => this.getAppointment(id.toString())))
    }

    async searchForAppointments(params: FetchAppointmentsParams) {
        let path = `/appointments?calendarID=${params.calendarId}&appointmenTypeID=${params.appointmentTypeId}`
        if (params.classTime) {
            const date = params.classTime.split('T')[0]
            path += `&minDate=${date}&maxDate=${date}`
        }
        let result = await this._request<Acuity.Appointment[]>(path)
        if (params.classId) {
            result = result.filter((it) => it.classID === params.classId)
        }
        return result.filter((it) => it.appointmentTypeID === params.appointmentTypeId)
    }

    async getAppointmentTypes(input: GetAppointmentTypesParams) {
        let appointmentTypes = await this._request<Acuity.AppointmentType[]>(`/appointment-types`)
        if (input.category) {
            appointmentTypes = appointmentTypes.filter((it) => it.category === input.category)
        }
        if (input.availableToBook) {
            appointmentTypes = appointmentTypes.filter((it) => it.color === '#FFFFFF')
        }
        return appointmentTypes
    }

    scheduleAppointment(body: ScheduleAppointmentParams) {
        return this._request<Acuity.Appointment>('/appointments?admin=true', { method: 'POST', body })
    }

    cancelAppointment(id: number) {
        return this._request(`/appointments/${id}/cancel?admin=true`, { method: 'PUT' })
    }

    getClasses(appointmentTypeId: number, includeUnavailable: boolean, minDate?: number) {
        let path = `/availability/classes?appointmentTypeID=${appointmentTypeId}`
        if (minDate) {
            path += `&minDate=${encodeURIComponent(new Date(minDate).toISOString())}`
        }
        if (includeUnavailable) {
            path += `&includeUnavailable=true`
        }
        return this._request<Acuity.Class[]>(path)
    }

    getCalendars() {
        return this._request<Acuity.Calendar[]>(`/calendars`)
    }

    checkCertificate(certificate: string, appointmentTypeId: number, email: string): Promise<Acuity.Certificate> {
        return this._request<Acuity.Certificate>(
            `/certificates/check?certificate=${certificate}&appointmentTypeID=${appointmentTypeId}&email=${email}`
        )
    }

    updateLabel(params: UpdateLabelParams) {
        const labelMap: { [key in Exclude<Label, 'none'>]: number } = {
            'checked-in': Acuity.Constants.Labels.CHECKED_IN,
            'checked-out': Acuity.Constants.Labels.CHECKED_OUT,
            'not-attending': Acuity.Constants.Labels.NOT_ATTENDING,
        }
        const label = params.label === 'none' ? [] : [{ id: labelMap[params.label] }]
        return this.updateAppointment({ id: params.appointmentId, labels: label })
    }
}

let client: Client
export async function getAcuityClient() {
    if (client) return client
    client = new Client()
    await client._initialise()
    return client
}
