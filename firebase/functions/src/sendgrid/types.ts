export type Emails = {
    holidayProgramConfirmation: {
        parentName: string
        location: string
        address: string
        bookings: { datetime: string; confirmationPage: string }[]
    }

    termContinuationEmail: {
        parentName: string
        className: string
        price: string
        childName: string
        continueUrl: string
        unenrollUrl: string
    }

    scienceTermEnrolmentConfirmation: {
        parentName: string
        childName: string
        className: string
        appointmentTimes: string[]
        calendarName: string
        price: string
        location: string
        numberOfWeeks: string
    }

    scienceTermUnenrolmentConfirmation: {
        parentName: string
        childName: string
        className: string
    }

    scienceParentPortalLink: {
        parentName: string
        childName: string
        className: string
        portalUrl: string
    }

    partyFormFilledInAgain: {
        parentName: string
        parentEmail: string
        parentMobile: string
        childName: string
        dateTime: string
        oldNumberOfKids: string
        oldCreations: string[]
        oldAdditions: string[]
        newNumberOfKids: string
        newCreations: string[]
        newAdditions: string[]
    }

    eventBooking: {
        contactName: string
        location: string
        slots: { startTime: string; endTime: string }[]
        emailMessage: string
    }
}
