import { PFQuestion } from '../paperform'
import { EventBooking, ScheduleEventParams } from '../partyBookings/Event'
import { SendInvoiceParams, RetrieveInvoiceStatusesParams, InvoiceStatusMap } from '../scienceclub/invoicing'
import {
    Booking,
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    GenerateTimesheetsParams,
    GenerateTimesheetsResponse,
    InitiateEmployeeProps,
    Location,
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
    initiateOnboarding: CloudFunction<InitiateEmployeeProps, void>
    createPartyBooking: CloudFunction<Booking, void>
    updatePartyBooking: CloudFunction<{ bookingId: string; booking: Booking }, void>
    deletePartyBooking: CloudFunction<
        { bookingId: string; eventId: string; location: Location; type: Booking['type'] },
        void
    >
}

export interface PubSubFunctions {
    handlePartyFormSubmission: PFQuestion<any>[]
    createEmployee: { employeeId: string }
}

export type CloudFunction<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
