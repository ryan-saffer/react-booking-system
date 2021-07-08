import { Function } from '../firebase/functions'
import { Appointment } from ".";

export interface AcuityFunctions {
    getAppointments: Function<FetchAppointmentsParams, Appointment[]>
    updateEnrolment: Function<UpdateScienceEnrolmentParams, Appointment[]>
    unenrollChildFromTerm: Function<UnenrollChildFromTermParams, null> // number = appointmentId
}

export interface FetchAppointmentsParams {
    appointmentTypeID: number
    calendarID: number
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