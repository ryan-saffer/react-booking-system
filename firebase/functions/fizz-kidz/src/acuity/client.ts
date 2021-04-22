import { Function } from '../firebase/functions'
import { Appointment } from ".";

export interface AcuityFunctions {
    getAppointments: Function<FetchAppointmentsParams, Appointment[]>
}

export interface FetchAppointmentsParams {
    appointmentTypeID: number,
    calendarID: number,
}