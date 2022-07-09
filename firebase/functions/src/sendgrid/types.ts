export type Emails = {
    holidayProgramConfirmation: {
        templateName: 'holiday_program_confirmation.html'
        parentEmail: string
        values: {
            parentName: string
            location: string
            address: string
            bookings: { datetime: string; confirmationPage: string }[]
        }
    }
}
