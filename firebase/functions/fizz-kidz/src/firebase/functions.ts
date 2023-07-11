import { EventBooking, ScheduleEventParams } from './../booking/Event'
import { SendInvoiceParams, RetrieveInvoiceStatusesParams, InvoiceStatusMap } from '../scienceclub/invoicing'
import {
    Booking,
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    GenerateTimesheetsParams,
    GenerateTimesheetsResponse,
    NewEmployee,
    ScheduleScienceAppointmentParams,
    ScienceEnrolment,
    SendTermContinuationEmailsParams,
    UnenrollScienceAppointmentsParams,
    UpdatePaymentIntentParams,
    UpdateScienceEnrolmentParams,
} from '..'
import { FreeHolidayProgramBooking } from '../holidayPrograms'

export interface FirebaseFunctions {
    retrieveInvoiceStatuses: CloudFunction<RetrieveInvoiceStatusesParams, InvoiceStatusMap>
    sendInvoices: CloudFunction<SendInvoiceParams[], InvoiceStatusMap>
    sendTermContinuationEmails: CloudFunction<SendTermContinuationEmailsParams, string[]>
    createPaymentIntent: CloudFunction<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: CloudFunction<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: CloudFunction<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointments: CloudFunction<UnenrollScienceAppointmentsParams, void>
    updateScienceEnrolment: CloudFunction<UpdateScienceEnrolmentParams, ScienceEnrolment>
    sendPortalLinks: CloudFunction<void, void>
    scheduleFreeHolidayPrograms: CloudFunction<FreeHolidayProgramBooking[], void>
    bookEvent: CloudFunction<ScheduleEventParams, void>
    updateEvent: CloudFunction<EventBooking, void>
    deleteEvent: CloudFunction<EventBooking, void>
    generateTimesheets: CloudFunction<GenerateTimesheetsParams, GenerateTimesheetsResponse>
    initiateOnboarding: CloudFunction<NewEmployee, void>
    createPartyBooking: CloudFunction<Booking, void>
    updatePartyBooking: CloudFunction<{ bookingId: string; booking: Booking }, void>
}

export type CloudFunction<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
