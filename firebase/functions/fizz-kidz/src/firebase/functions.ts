import { ScheduleEventParams } from './../booking/Event'
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
    bookEvent: CloudFunction<ScheduleEventParams, string>
}

export type CloudFunction<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
