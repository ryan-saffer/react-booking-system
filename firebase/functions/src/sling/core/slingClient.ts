import { Timesheet, User } from './types'

interface SlingClient {
    getUsers(): Promise<User[]>
}

export class SlingClientImpl implements SlingClient {
    private async _request(path: string) {
        const fetchResult = await fetch(`https://api.getsling.com/v1/${path}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.SLING_API_KEY ?? '',
            },
        })
        const result = await fetchResult.json()
        return result
    }

    async getUsers() {
        const users = await this._request('users/concise')
        return users.users as User[]
    }

    async getTimesheets(startDate: Date, endDate: Date): Promise<Timesheet[]> {
        const range = encodeURIComponent(`${startDate.toISOString()}/${endDate.toISOString()}`)
        console.log('range', range)
        const timesheets = await this._request(`reports/timesheets?dates=${range}`)
        return timesheets
    }
}
