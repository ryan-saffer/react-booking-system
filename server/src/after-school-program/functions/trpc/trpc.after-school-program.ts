import {
    ScheduleAfterSchoolEnrolmentParams,
    SendTermContinuationEmailsParams,
    UnenrollAfterSchoolParams,
    UpdateAfterSchoolEnrolmentParams,
} from 'fizz-kidz'

import { SheetsClient } from '../../../google/SheetsClient'
import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
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
})
