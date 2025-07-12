import type { LocationOrTest } from '../core/location'

export type ScheduleAfterSchoolEnrolmentParams = Pick<
    AfterSchoolEnrolment,
    | 'type'
    | 'inStudio'
    | 'appointmentTypeId'
    | 'calendarId'
    | 'parent'
    | 'child'
    | 'emergencyContact'
    | 'className'
    | 'pickupPeople'
    | 'joinMailingList'
>

export type SendTermContinuationEmailsParams = {
    appointmentIds: string[]
}

export type UnenrollAfterSchoolParams = {
    appointmentIds: string[]
    sendConfirmationEmail: boolean
}

export type UpdateAfterSchoolEnrolmentParams = {
    id: string
} & Partial<AfterSchoolEnrolment>

export type AfterSchoolEnrolment = {
    id: string
    type: 'science' | 'art'
    // if true the program is run at a Fizz studio, if false it is run at a school
    inStudio: boolean
    // inactive status will mean they are deleted in acuity
    status: 'active' | 'inactive'
    appointmentTypeId: number
    calendarId: number
    location: LocationOrTest
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
        age: string // age is needed for backwards compat. After Term 3 2024, age can be removed, and UI calculates age from dob.
        dob: string // ISO
        grade: string
        allergies: string
        isAnaphylactic: boolean
        anaphylaxisPlan: string
        support: string
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
    joinMailingList: boolean
}

export type Calendar = {
    id: string
    logoUrl: string
}
