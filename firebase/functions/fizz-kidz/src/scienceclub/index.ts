export type ScheduleScienceAppointmentParams = {
    appointmentTypeId: number
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentPhone: string
    childName: string
    childAge: string
    childGrade: string
    childAllergies: string
    childIsAnaphylactic: boolean
    emergencyContactName: string
    emergencyContactRelation: string
    emergencyContactNumber: string
    permissionToPhotograph: boolean
    type: string
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
    status: 'enrolled' | 'unenrolled'
    appointmentTypeId: number
    appointments: number[]
    childAge: string
    childGrade: string
    childName: string
    childAllergies: string
    childIsAnaphylactic: boolean
    parentEmail: string
    parentFirstName: string
    parentLastName: string
    parentPhone: string
    continuingWithTerm: "yes" | "no" | ""
    continuingEmailSent: boolean
    type: string
    invoiceId: string
    emergencyContactName: string
    emergencyContactRelation: string
    emergencyContactNumber: string
    notes: string
    permissionToPhotograph: boolean
    price: string
}