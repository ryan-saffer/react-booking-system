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

        console.log(response.status)
        console.log(await response.json())

        console.log('logging headers:')
        response.headers.forEach((header) => console.log(header))
        const auth = response.headers.get('authorization')

        if (!auth) {
            throw new Error('Unable to find auth header in sling login response')
        }
        console.log('Auth Token:', auth)

        this.#authToken = auth
    }

    async #request(path: string, method: 'GET' | 'POST', data?: any) {
        const firstFetchResponse = await fetch(`https://api.getsling.com/v1/${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.#authToken,
            },
            ...(method === 'POST' && { body: JSON.stringify(data) }),
        })
        const firstResult = await firstFetchResponse.json()

        console.log('first result:', firstResult)

        if (
            firstResult.message ===
            "The server could not verify that you are authorized to access the URL requested. You either supplied the wrong credentials (e.g. a bad password), or your browser doesn't understand how to supply the credentials required."
        ) {
            await this.#getAuthToken()
        }

        const fetchResult = await fetch(`https://api.getsling.com/v1/${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.#authToken,
            },
            ...(method === 'POST' && { body: JSON.stringify(data) }),
        })

        const result = await fetchResult.json()
        return result
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
