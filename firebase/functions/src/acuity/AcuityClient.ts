import { hasError } from './shared'
import { Acuity } from 'fizz-kidz'

const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

export class AcuityClient {
    private _request<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            acuity.request(path, (err: any, _resp: any, appointment: T | Acuity.Error) => {
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
}
