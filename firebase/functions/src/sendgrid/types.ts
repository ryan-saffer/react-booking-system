export type EmailInfo = {
    to: string
    from: {
        name: string
        email: string
    },
    subject: string
}

export type Emails = {
    holidayProgramConfirmation: {
        templateName: 'holiday_program_confirmation.html'
        values: {
            parentName: string
            location: string
            address: string
            bookings: { datetime: string; confirmationPage: string }[]
        }
    }

    termContinuationEmail: {
        templateName: 'term_continuation_email.html'
        values: {
            parentName: string
            className: string
            price: string
            childName: string
            continueUrl: string
            unenrollUrl: string
        }
    }

    scienceTermEnrolmentConfirmation: {
        templateName: 'science_term_enrolment_confirmation.html'
        values: {
            parentName: string
            childName: string
            className: string
            appointmentTimes: string[]
            calendarName: string
            price: string
            location: string
            numberOfWeeks: string
        }
    }
}
