import { CloudFunction } from '../firebase/functions'
import { Appointment, AppointmentType, Certificate } from '.'
import { Class } from './types'

export interface AcuityFunctions {
    searchForAppointments: CloudFunction<FetchAppointmentsParams, Appointment[]>
    getAppointments: CloudFunction<GetAppointmentsParams, Appointment[]>
    getAppointmentTypes: CloudFunction<GetAppointmentTypesParams, AppointmentType[]>
    updateLabel: CloudFunction<UpdateLabelParams, Appointment>
    updateAppointment: CloudFunction<UpdateAppointmentParams, Appointment>
    classAvailability: CloudFunction<ClassAvailabilityParams, Class[]>
    checkCertificate: CloudFunction<CheckCertificateParams, Certificate>
}

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
    category?: 'Science Club' | 'TEST'
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
