import type {
    CreateLittleLearnersEnrolmentParams,
    GetLittleLearnersEnrolmentParams,
    ListLittleLearnersEnrolmentsParams,
    RetrieveLittleLearnersInvoiceStatusesParams,
    SendLittleLearnersInvoiceParams,
    UnenrollLittleLearnersParams,
    UpdateLittleLearnersEnrolmentParams,
} from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '@/trpc/trpc'

import { createLittleLearnersEnrolment } from '../../core/create-little-learners-enrolment'
import { getLittleLearnersEnrolment } from '../../core/get-little-learners-enrolment'
import { listLittleLearnersEnrolments } from '../../core/list-little-learners-enrolments'
import { retrieveLittleLearnersInvoiceStatuses } from '../../core/retrieve-little-learners-invoice-statuses'
import { sendLittleLearnersInvoices } from '../../core/send-little-learners-invoices'
import { unenrollLittleLearners } from '../../core/unenroll-little-learners'
import { updateLittleLearnersEnrolment } from '../../core/update-little-learners-enrolment'

export const littleLearnersRouter = router({
    createEnrolment: publicProcedure
        .input((input: unknown) => input as CreateLittleLearnersEnrolmentParams)
        .mutation(({ input }) => createLittleLearnersEnrolment(input)),
    getEnrolment: authenticatedProcedure
        .input((input: unknown) => input as GetLittleLearnersEnrolmentParams)
        .query(({ input }) => getLittleLearnersEnrolment(input)),
    listEnrolments: authenticatedProcedure
        .input((input: unknown) => input as ListLittleLearnersEnrolmentsParams)
        .query(({ input }) => listLittleLearnersEnrolments(input)),
    retrieveInvoiceStatuses: authenticatedProcedure
        .input((input: unknown) => input as RetrieveLittleLearnersInvoiceStatusesParams)
        .query(({ input }) => retrieveLittleLearnersInvoiceStatuses(input)),
    sendInvoices: authenticatedProcedure
        .input((input: unknown) => input as SendLittleLearnersInvoiceParams[])
        .mutation(({ input }) => sendLittleLearnersInvoices(input)),
    unenrollFromLittleLearners: authenticatedProcedure
        .input((input: unknown) => input as UnenrollLittleLearnersParams)
        .mutation(({ input }) => unenrollLittleLearners(input)),
    updateEnrolment: authenticatedProcedure
        .input((input: unknown) => input as UpdateLittleLearnersEnrolmentParams)
        .mutation(({ input }) => updateLittleLearnersEnrolment(input)),
})
