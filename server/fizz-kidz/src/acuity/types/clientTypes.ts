// For querying acuity, ie all appointments from a certain type and calendar
export type FetchAppointmentsParams = {
    appointmentTypeId: number
    calendarId: number
    classId?: number
    classTime?: string
}

// For getting specific appointments by ids
export type GetAppointmentsParams = {
    ids: number[]
}

export type GetAppointmentTypesParams = {
    category?: Array<
        | 'Science Club'
        | 'Art Program'
        | 'TEST'
        | 'TEST-science'
        | 'TEST-art'
        | 'test-after-school-in-studio'
        | 'science-balwyn'
        | 'science-essendon'
        | 'science-malvern'
        | 'science-cheltenham'
        | 'science-kingsville'
        | 'art-balwyn'
        | 'art-essendon'
        | 'art-malvern'
        | 'art-cheltenham'
        | 'art-kingsville'
    >
    availableToBook?: boolean
}

export type ContinuingOption = 'yes' | 'no' | ''
export type CheckboxValue = 'yes' | ''

export type FormValue = ContinuingOption | CheckboxValue

export interface UpdateScienceEnrolmentParams {
    email: string
    appointmentTypeId: number
    childName: string
    fieldId: number
    value: FormValue
}

export interface UnenrollChildFromTermParams {
    appointmentId: number
}

export type Label = 'none' | 'checked-in' | 'checked-out' | 'not-attending'

export interface UpdateLabelParams {
    appointmentId: number
    label: Label
}

export type UpdateAppointmentParams = {
    id: number
    labels?: { id: number }[]
}

export type ClassAvailabilityParams = {
    appointmentTypeId: number
    includeUnavailable: boolean
    minDate?: number
}

export type CheckCertificateParams = {
    certificate: string
    appointmentTypeId: number
    email: string
}
