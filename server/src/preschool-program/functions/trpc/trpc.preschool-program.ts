import type {
    CreatePreschoolProgramEnrolmentParams,
    GetPreschoolProgramEnrolmentParams,
    ListPreschoolProgramEnrolmentsParams,
    RetrievePreschoolProgramInvoiceStatusesParams,
    SendPreschoolProgramInvoiceParams,
    UnenrollPreschoolProgramParams,
    UpdatePreschoolProgramEnrolmentParams,
} from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '@/trpc/trpc'

import { createPreschoolProgramEnrolment } from '../../core/create-preschool-program-enrolment'
import { getPreschoolProgramEnrolment } from '../../core/get-preschool-program-enrolment'
import { listPreschoolProgramEnrolments } from '../../core/list-preschool-program-enrolments'
import { retrievePreschoolProgramInvoiceStatuses } from '../../core/retrieve-preschool-program-invoice-statuses'
import { sendPreschoolProgramInvoices } from '../../core/send-preschool-program-invoices'
import { unenrollPreschoolProgram } from '../../core/unenroll-preschool-program'
import { updatePreschoolProgramEnrolment } from '../../core/update-preschool-program-enrolment'

export const preschoolProgramRouter = router({
    createEnrolment: publicProcedure
        .input((input: unknown) => input as CreatePreschoolProgramEnrolmentParams)
        .mutation(({ input }) => createPreschoolProgramEnrolment(input)),
    getEnrolment: authenticatedProcedure
        .input((input: unknown) => input as GetPreschoolProgramEnrolmentParams)
        .query(({ input }) => getPreschoolProgramEnrolment(input)),
    listEnrolments: authenticatedProcedure
        .input((input: unknown) => input as ListPreschoolProgramEnrolmentsParams)
        .query(({ input }) => listPreschoolProgramEnrolments(input)),
    retrieveInvoiceStatuses: authenticatedProcedure
        .input((input: unknown) => input as RetrievePreschoolProgramInvoiceStatusesParams)
        .query(({ input }) => retrievePreschoolProgramInvoiceStatuses(input)),
    sendInvoices: authenticatedProcedure
        .input((input: unknown) => input as SendPreschoolProgramInvoiceParams[])
        .mutation(({ input }) => sendPreschoolProgramInvoices(input)),
    unenrollFromPreschoolProgram: authenticatedProcedure
        .input((input: unknown) => input as UnenrollPreschoolProgramParams)
        .mutation(({ input }) => unenrollPreschoolProgram(input)),
    updateEnrolment: authenticatedProcedure
        .input((input: unknown) => input as UpdatePreschoolProgramEnrolmentParams)
        .mutation(({ input }) => updatePreschoolProgramEnrolment(input)),
})
