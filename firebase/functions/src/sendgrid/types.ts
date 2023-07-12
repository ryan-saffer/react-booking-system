export type Emails = {
    // HOLIDAY PROGRAMS
    holidayProgramConfirmation: {
        parentName: string
        location: string
        address: string
        bookings: { datetime: string; confirmationPage: string }[]
    }

    // SCIENCE PROGRAM
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

    // BIRTHDAY PARTIES
    partyBookingConfirmation: {
        parentName: string
        childName: string
        childAge: string
        startDate: string
        startTime: string
        endTime: string
        address: string
        location: string
        isMobile: boolean
        creationCount: string
        managerName: string
        managerMobile: string
        managerEmail: string
        numberOfKidsAllowed: string[]
        studioPhotoUrl: string
    }

    partyForm: {
        parentName: string
        childName: string
        childAge: string
        startDate: string
        startTime: string
        endTime: string
        address: string
        location: string
        prefilledFormUrl: string
        managerName: string
        isMobile: boolean
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

    tooManyCreationsChosen: {
        parentName: string
        parentEmail: string
        parentMobile: string
        childName: string
        dateTime: string
        chosenCreations: string[]
    }

    partyFormQuestions: {
        dateTime: string
        location: string
        parentName: string
        childName: string
        questions: string
        parentEmail: string
    }

    partyPackNotification: {
        parentName: string
        dateTime: string
        location: string
        mobile: string
        email: string
        partyPacks: string[]
    }

    partyFormConfirmation: {
        parentName: string
        numberOfChildren: string
        creations: string[]
        isTyeDyeParty: boolean
        hasAdditions: boolean
        additions: string[]
        isMobile: boolean
        hasQuestions: boolean
        managerName: string
        managerMobile: string
    }

    partyFeedback: {
        parentName: string
        childName: string
        reviewUrl: string
    }

    // EVENTS
    eventBooking: {
        contactName: string
        location: string
        slots: { startTime: string; endTime: string }[]
        emailMessage: string
        price: string
    }

    // ONBOARDING
    onboarding: {
        employeeName: string
        formUrl: string
        senderName: string
    }
}
