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
    groupIds: number[]
    wages?: Record<
        number,
        {
            id: number
            dateEffective: string // 2024-12-24
            regularRate: string // "39"
            isSalary: false
            locationId: null
            positionId: number
        }[]
    >
}

export type CreateUser = Omit<User, 'id' | 'active'> & {
    groups: { id: number }[]
    invite: false
    accessToLaborCost: false
    timeclockEnabled: true
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

export type UpdateWagesBody = {
    id?: number
    dateEffective: string // 2025-05-24
    fromDate: string //iso
    positionId: number
    isSalary: false
    locationId: null
    regularRate: string // "24"
    userId: number
    _edited: false
}[]
