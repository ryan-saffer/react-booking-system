import { Function } from '../firebase/functions'
import { Appointment } from ".";

export interface AcuityFunctions {
    getAppointments: Function<FetchAppointmentsParams, Appointment[]>
    updateEnrolment: Function<UpdateScienceEnrolmentParams, Appointment[]>
}

export interface FetchAppointmentsParams {
    appointmentTypeID: number
    calendarID: number
}

export type ContinuingOptions = 'yes' | 'no' | ''

export interface UpdateScienceEnrolmentParams {
    email: string
    appointmentTypeId: number
    childName: string
    continuing: ContinuingOptions
}