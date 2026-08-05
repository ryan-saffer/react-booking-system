import type {
    RetrieveInvoiceStatusesParams,
    ScheduleAfterSchoolEnrolmentParams,
    SendInvoiceParams,
    SendTermContinuationEmailsParams,
    UnenrollAfterSchoolParams,
    UpdateAfterSchoolEnrolmentParams,
} from '@fizz-kidz/core'

import { authenticatedProcedure, publicProcedure, router } from '@/app/trpc/trpc'
import { retrieveInvoiceStatuses } from '@/features/after-school-program/core/retrieve-invoice-statuses'
import { sendInvoices } from '@/features/after-school-program/core/send-invoices'
import { SheetsClient } from '@/integrations/google/sheets.client'

import scheduleAfterSchoolProgram from '../../core/schedule-after-school-program'
import { sendTermContinutationEmails } from '../../core/send-term-continutation-email'
import { unenrollAfterSchoolAppointments } from '../../core/unenroll-after-school-appointments'
import { updateAfterSchoolEnrolment } from '../../core/update-after-school-enrolment'

export const afterSchoolProgramRouter = router({
    sendTermContinuationEmails: authenticatedProcedure
        .input((input: unknown) => input as SendTermContinuationEmailsParams)
        .mutation(({ input }) => sendTermContinutationEmails(input)),
    scheduleAfterSchoolEnrolment: publicProcedure
        .input((input: unknown) => input as ScheduleAfterSchoolEnrolmentParams[])
        .mutation(({ input }) => Promise.all(input.map((it) => scheduleAfterSchoolProgram(it)))),
    unenrollFromAfterSchoolProgram: authenticatedProcedure
        .input((input: unknown) => input as UnenrollAfterSchoolParams)
        .mutation(({ input }) => unenrollAfterSchoolAppointments(input)),
    updateAfterSchoolEnrolment: publicProcedure
        .input((input: unknown) => input as UpdateAfterSchoolEnrolmentParams)
        .mutation(({ input }) => updateAfterSchoolEnrolment(input)),
    joinWaitList: publicProcedure
        .input(
            (input: unknown) =>
                input as {
                    parentName: string
                    parentEmail: string
                    parentMobile: string
                    childName: string
                    program: string
                }
        )
        .mutation(async ({ input }) => {
            const sheetsClient = await SheetsClient.getInstance()
            await sheetsClient.addRowToSheet('afterSchoolProgramWaitlist', [
                [input.program, input.parentName, input.parentEmail, input.parentMobile, input.childName],
            ])
        }),
    sendInvoices: authenticatedProcedure
        .input((input) => input as SendInvoiceParams[])
        .mutation(({ input }) => sendInvoices(input)),
    retrieveInvoiceStatuses: publicProcedure
        .input((input) => input as RetrieveInvoiceStatusesParams)
        .query(({ input }) => retrieveInvoiceStatuses(input)),
})
