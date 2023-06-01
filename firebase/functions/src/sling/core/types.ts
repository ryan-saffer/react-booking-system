export type User = {
    id: number
    active: boolean
    timezone: string
    legalName: string
    lastname: string
    employeeId: string
}

export type Timesheet = {
    status: 'published'
    dtstart: string
    dtend: string
    user: { id: number }
    position: { id: number }
    location: { id: number }
}
