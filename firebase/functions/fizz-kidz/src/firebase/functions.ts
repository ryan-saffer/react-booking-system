import { EventBooking } from './../booking/Event'
import { SendInvoiceParams, RetrieveInvoiceStatusesParams, InvoiceStatusMap } from '../scienceclub/invoicing'
import {
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    ScheduleScienceAppointmentParams,
    ScienceEnrolment,
    SendTermContinuationEmailsParams,
    UnenrollScienceAppointmentsParams,
    UpdatePaymentIntentParams,
    UpdateScienceEnrolmentParams,
} from '..'
import { FreeHolidayProgramBooking } from '../holidayPrograms'

export interface FirebaseFunctions {
    retrieveInvoiceStatuses: Function<RetrieveInvoiceStatusesParams, InvoiceStatusMap>
    sendInvoices: Function<SendInvoiceParams[], InvoiceStatusMap>
    sendTermContinuationEmails: Function<SendTermContinuationEmailsParams, string[]>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: Function<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointments: Function<UnenrollScienceAppointmentsParams, void>
    updateScienceEnrolment: Function<UpdateScienceEnrolmentParams, ScienceEnrolment>
    sendPortalLinks: Function<void, void>
    scheduleFreeHolidayPrograms: Function<FreeHolidayProgramBooking[], void>
    bookEvent: Function<EventBooking, string>
}

export type CloudFunction<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
