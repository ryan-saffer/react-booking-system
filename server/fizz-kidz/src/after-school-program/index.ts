export type ScheduleAfterSchoolEnrolmentParams = Pick<
    AfterSchoolEnrolment,
    'appointmentTypeId' | 'calendarId' | 'parent' | 'child' | 'emergencyContact' | 'className' | 'pickupPeople'
>

export type SendTermContinuationEmailsParams = {
    appointmentIds: string[]
}

export type UnenrollAfterSchoolParams = {
    appointmentIds: string[]
}

export type UpdateAfterSchoolEnrolmentParams = {
    id: string
} & Partial<AfterSchoolEnrolment>

export type AfterSchoolEnrolment = {
    id: string
    // inactive status will mean they are deleted in acuity
    status: 'active' | 'inactive'
    appointmentTypeId: number
    calendarId: number
    appointments: number[]
    parent: {
        firstName: string
        lastName: string
        email: string
        phone: string
    }
    child: {
        firstName: string
        lastName: string
        age: string
        grade: string
        allergies: string
        isAnaphylactic: boolean
        anaphylaxisPlan: string
        permissionToPhotograph: boolean
    }
    emergencyContact: {
        name: string
        relation: string
        phone: string
    }
    continuingWithTerm: 'yes' | 'no' | ''
    className: string
    invoiceId: string
    notes: string
    price: string // eg. "24.00"
    pickupPeople: string[]
    emails: {
        portalLinkEmailSent: boolean
        continuingEmailSent: boolean
    }
    signatures: {
        [key: number]: {
            pickupPerson: string
            timestamp: number
            signature: string
            staffReason: string
        }
    }
}

export type Calendar = {
    id: string
    logoUrl: string
}
