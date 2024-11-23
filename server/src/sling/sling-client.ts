import type { CreateUser, Timesheet, User } from '../staff/core/timesheets/timesheets.types'

export class SlingClient {
    #authToken: string = ''

    async #getAuthToken() {
        const response = await fetch(`https://api.getsling.com/account/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'talia@fizzkidz.com.au',
                password: process.env.SLING_PASSWORD ?? '',
                captchaResponse: null,
                snsToken: null,
                snsPlatform: null,
            }),
        })

        const auth = response.headers.get('authorization')
        if (!auth) {
            throw new Error('Unable to find auth header in sling login response')
        }

        this.#authToken = auth
    }

    async #request(path: string, method: 'GET' | 'POST', data?: any, retryCount = 0): Promise<any> {
        const response = await fetch(`https://api.getsling.com/v1/${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.#authToken,
            },
            ...(method === 'POST' && { body: JSON.stringify(data) }),
        })

        if (response.status === 401 && retryCount === 0) {
            await this.#getAuthToken()
            return this.#request(path, method, data, retryCount++)
        }

        if (response.ok) {
            const result = await response.json()
            return result
        } else {
            throw new Error(`Error calling sling api: '${response.statusText}'`)
        }
    }

    #get(path: string) {
        return this.#request(path, 'GET')
    }

    #post(path: string, data: any) {
        return this.#request(path, 'POST', data)
    }

    async getUsers() {
        const users = await this.#get('users/concise')
        return users.users as User[]
    }

    createUser(user: CreateUser) {
        return this.#post('users', user)
    }

    async getTimesheets(startDate: Date, endDate: Date): Promise<Timesheet[]> {
        const range = encodeURIComponent(`${startDate.toISOString()}/${endDate.toISOString()}`)
        const timesheets = await this.#get(`reports/timesheets?dates=${range}`)
        return timesheets
    }
}
