export type Emails = {
    holidayProgramConfirmation: {
        templateName: 'holiday_program_confirmation.html'
        emailAddress: string
        values: {
            parentName: string
            location: string
            address: string
            bookings: { datetime: string; confirmationPage: string }[]
        }
    }
    termContinuationEmail: {
        templateName: 'term_continuation_email.html',
        emailAddress: string,
        values: {
            parentName: string
            className: string
            price: string
            childName: string
            continueUrl: string
            unenrollUrl: string
        }
    }
}
