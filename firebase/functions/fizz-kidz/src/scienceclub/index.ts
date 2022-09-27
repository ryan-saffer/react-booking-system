export type ScheduleScienceAppointmentParams = {
    appointmentTypeId: number
    calendarId: number
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentPhone: string
    childFirstName: string
    childLastName: string
    childAge: string
    childGrade: string
    childAllergies: string
    childIsAnaphylactic: boolean
    anaphylaxisPlan: string
    emergencyContactName: string
    emergencyContactNumber: string
    permissionToPhotograph: boolean
    className: string
    pickupPeople: string[]
}

export type SendTermContinuationEmailParams = {
    appointmentId: string
}

export type UnenrollScienceAppointmentParams = {
    appointmentId: string
}

export type UpdateScienceEnrolmentParams = {
    appointmentId: string
} & Partial<ScienceAppointment>

export type ScienceAppointment = {
    id: string
    // inactive status will mean they are deleted in acuity
    status: 'active' | 'inactive'
    appointmentTypeId: number
    appointments: number[]
    childAge: string
    childGrade: string
    childFirstName: string
    childLastName: string
    childAllergies: string
    childIsAnaphylactic: boolean
    anaphylaxisPlan: string
    parentEmail: string
    parentFirstName: string
    parentLastName: string
    parentPhone: string
    continuingWithTerm: 'yes' | 'no' | ''
    className: string
    invoiceId: string
    emergencyContactName: string
    emergencyContactNumber: string
    notes: string
    permissionToPhotograph: boolean
    price: string
    pickupPeople: string[]
    emails: {
        portalLinkEmailSent: boolean
        continuingEmailSent: boolean
    }
}

export type Calendar = {
    id: string
    logoUrl: string
}
