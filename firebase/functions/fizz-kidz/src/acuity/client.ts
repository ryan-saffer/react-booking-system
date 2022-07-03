import { Function } from '../firebase/functions'
import { Appointment } from ".";
import { Class } from './types';

export interface AcuityFunctions {
    getAppointments: Function<FetchAppointmentsParams, Appointment[]>
    updateEnrolment: Function<UpdateScienceEnrolmentParams, Appointment[]>
    unenrollChildFromTerm: Function<UnenrollChildFromTermParams, null> // number = appointmentId
    updateLabel: Function<UpdateLabelParams, Appointment>
    classAvailability: Function<ClassAvailabilityParams, Class[]>
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

export interface UpdateLabelParams {
    appointmentId: number
    label: number // Acuity.Constants.Labels
}

export type ClassAvailabilityParams = {
    appointmentTypeId: number
}