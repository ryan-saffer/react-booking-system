import { Function } from '../firebase/functions'
import { Appointment, AppointmentType, Certificate } from '.'
import { Class } from './types'

export interface AcuityFunctions {
    searchForAppointments: Function<FetchAppointmentsParams, Appointment[]>
    getAppointments: Function<GetAppointmentsParams, Appointment[]>
    getAppointmentTypes: Function<GetAppointmentTypesParams, AppointmentType[]>
    updateLabel: Function<UpdateLabelParams, Appointment>
    updateAppointment: Function<UpdateAppointmentParams, Appointment>
    classAvailability: Function<ClassAvailabilityParams, Class[]>
    checkCertificate: Function<CheckCertificateParams, Certificate>
}

// For querying acuity, ie all appointments from a certain type and calendar
export type FetchAppointmentsParams = {
    appointmentTypeId: number
    calendarId: number
    classTime?: string
}

// For getting specific appointments by ids
export type GetAppointmentsParams = {
    ids: number[]
}

export type GetAppointmentTypesParams = {
    category?: string
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

interface BaseHolidayProgramBooking {
    appointmentTypeId: number
    dateTime: string
    calendarId: number
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentPhone: string
    emergencyContactName: string
    emergencyContactPhone: string
    childName: string
    childAge: string
    childAllergies: string
    discountCode: string
    amountCharged: number
}

interface BookedHolidayProgram extends BaseHolidayProgramBooking {
    booked: true
    appointmentId: number
}

interface UnbookedHolidayProgram extends BaseHolidayProgramBooking {
    booked: false
}

export type HolidayProgramBooking = BookedHolidayProgram | UnbookedHolidayProgram

export type CheckCertificateParams = {
    certificate: string
    appointmentTypeId: number
    email: string
}
