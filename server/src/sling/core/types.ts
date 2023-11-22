export type User = {
    id: number
    active: boolean
    timezone: string
    legalName: string
    name: string
    email: string
    lastname: string
    employeeId: string
    countryCode: string
    countryISOCode: string
    phone: string
    role: string
}

export type Timesheet = {
    status: 'published'
    dtstart: string
    dtend: string
    user: { id: number }
    position: { id: number }
    location: { id: number }
    summary: string
}

export type Rate = number | 'not required'

export type CreateUser = Omit<User, 'id' | 'active'> & {
    groups: { id: number }[]
    invite: false
    accessToLaborCost: false
    timeclockEnabled: true
}
