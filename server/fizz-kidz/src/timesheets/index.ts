export type GenerateTimesheetsParams = {
    startDateInput: string
    endDateInput: string
}

export type GenerateTimesheetsResponse = {
    url: string
    skippedEmployees: string[]
    employeesWithBirthday: string[]
    employeesUnder18Over30Hrs: string[]
}
