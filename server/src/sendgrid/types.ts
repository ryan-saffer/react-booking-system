export type Emails = {
    // HOLIDAY PROGRAMS
    holidayProgramConfirmation: {
        parentName: string
        location: string
        address: string
        bookings: { datetime: string; confirmationPage: string }[]
    }

    kingsvilleOpeningConfirmation: {
        parentName: string
        location: string
        address: string
        bookings: { datetime: string; confirmationPage: string }[]
    }

    createDiscountCode: {
        name: string
        code: string
        expiryDate: string
    }

    // PLAY LAB
    playLabBookingConfirmation: {
        parentName: string
        location: string
        bookings: { time: string; details: string }[]
    }

    // AFTER SCHOOL PROGRAM
    termContinuationEmail: {
        parentName: string
        className: string
        price: string
        childName: string
        continueUrl: string
        unenrollUrl: string
    }

    afterSchoolEnrolmentConfirmation: {
        isScience: boolean
        isArt: boolean
        inStudio: boolean
        parentName: string
        childName: string
        className: string
        appointmentTimes: string[]
        calendarName: string
        price: string
        location: string
        numberOfWeeks: string
    }

    afterSchoolUnenrolmentConfirmation: {
        parentName: string
        childName: string
        className: string
    }

    afterSchoolParentPortalLink: {
        parentName: string
        childName: string
        className: string
        portalUrl: string
    }

    notContinuingNotification: {
        parentName: string
        parentEmail: string
        parentMobile: string
        childName: string
        program: string
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
        managerSubjectPronoun: string
        managerObjectPronoun: string
        numberOfKidsAllowed: string[]
        studioPhotoUrl: string
        invitationsUrl: string
        includesFood: boolean
        canOrderCake: boolean
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

    partyFormReminder: {
        parentName: string
        childName: string
        managerName: string
        managerMobile: string
        prefilledFormUrl: string
    }

    partyFormFoodPackageChanged: {
        parentName: string
        parentEmail: string
        parentMobile: string
        childName: string
        dateTime: string
        oldIncludesFood: boolean
        newIncludesFood: boolean
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
        oldIncludesFood: boolean
        newIncludesFood: boolean
        isMobile: boolean
        oldCake?: {
            selection: string
            size: string
            flavours: string
            served: string
            candles: string
            message?: string
        }
        newCake?: {
            selection: string
            size: string
            flavours: string
            served: string
            candles: string
            message?: string
        }
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
        includesFood: boolean
        cake?: {
            selection: string
            size: string
            flavours: string
            served: string
            candles: string
            message?: string
        }
    }

    partyFeedback: {
        parentName: string
        childName: string
        reviewUrl: string
    }

    invitationGuests: {
        name: string
    }

    cakeNotification: {
        parentName: string
        dateTime: string
        studio: string
        mobile: string
        email: string
        cakeSelection: string
        cakeSize: string
        cakeFlavours: string
        cakeServed: string
        cakeCandles: string
        cakeMessage?: string
    }

    // EVENTS
    standardEventBookingConfirmation: {
        contactName: string
        address: string
        slots: { startTime: string; endTime: string }[]
        emailMessage: string
        price: string
    }

    incursionBookingConfirmation: {
        contactName: string
        organisation: string
        address: string
        slots: { startTime: string; endTime: string }[]
        emailMessage: string
        incursion: string
        module: string
        price: string
    }

    incursionForm: {
        contactName: string
        incursionName: string
        organisation: string
        slots: string[]
        formUrl: string
    }

    incursionFormCompleted: {
        contactName: string
        slots: string[]
        numberOfChildren: string
        location: string
        parking: string
        expectedLearning: string
        teacherInformation: string
        additionalInformation: string
    }

    // ONBOARDING
    onboarding: {
        employeeName: string
        formUrl: string
        senderName: string
    }

    onboardingFormCompletedNotification: {
        employeeName: string
    }

    wwccReminder: {
        employees: string[]
    }

    accountInvite: {
        firstname: string
        resetLink: string
    }

    // WEBSITE FORMS
    websiteContactFormToCustomer: {
        name: string
        email: string
        contactNumber: string
        service: string
        location?: string
        suburb?: string
        preferredDateAndTime?: string
        enquiry: string
        reference: string
    }

    websiteContactFormToFizz: {
        name: string
        email: string
        contactNumber: string
        service: string
        location?: string
        suburb?: string
        preferredDateAndTime?: string
        enquiry: string
        reference: string
    }

    websiteEventFormToCustomer: {
        name: string
        email: string
        contactNumber?: string
        company: string
        preferredDateAndTime: string
        enquiry: string
    }

    websiteEventFormToFizz: {
        name: string
        email: string
        contactNumber?: string
        company: string
        preferredDateAndTime: string
        enquiry: string
    }

    websiteIncurionFormToCustomer: {
        name: string
        school: string
        email: string
        contactNumber: string
        preferredDateAndTime: string
        module: string
        enquiry: string
    }

    websiteIncurionFormToFizz: {
        name: string
        school: string
        email: string
        contactNumber: string
        preferredDateAndTime: string
        module: string
        enquiry: string
    }

    websiteCareersFormToCustomer: {
        name: string
        email: string
        contactNumber: string
        role: string
        location: string
        wwcc: string
        driversLicense: string
        resumeUrl: string
        resumeFilename: string
        application: string
        reference: string
    }

    websiteCareersFormToFizz: {
        name: string
        email: string
        contactNumber: string
        role: string
        location: string
        wwcc: string
        driversLicense: string
        resumeUrl: string
        resumeFilename: string
        application: string
        reference: string
    }

    websitePartyFormToCustomer: {
        name: string
        email: string
        contactNumber: string
        location: string
        suburb?: string
        preferredDateAndTime: string
        enquiry: string
        reference: string
    }

    websitePartyFormToFizz: {
        name: string
        email: string
        contactNumber: string
        location: string
        suburb?: string
        preferredDateAndTime: string
        enquiry: string
        reference: string
    }

    websiteFranchisingFormToCustomer: {
        firstName: string
        lastName: string
        email: string
        contactNumber: string
        suburb: string
        state: string
        experience: string
        interest: string
        enquiry: string
        reference: string
    }

    websiteFranchisingFormToFizz: {
        firstName: string
        lastName: string
        email: string
        contactNumber: string
        suburb: string
        state: string
        experience: string
        interest: string
        enquiry: string
        reference: string
    }
}
