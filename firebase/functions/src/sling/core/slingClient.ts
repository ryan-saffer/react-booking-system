import type { Timesheet, User, CreateUser } from './types'

export class SlingClient {
    async #request(path: string, method: 'GET' | 'POST', data?: any) {
        const fetchResult = await fetch(`https://api.getsling.com/v1/${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.SLING_API_KEY ?? '',
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
