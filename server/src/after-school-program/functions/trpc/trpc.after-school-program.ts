import {
    ScheduleAfterSchoolEnrolmentParams,
    SendTermContinuationEmailsParams,
    UnenrollAfterSchoolParams,
    UpdateAfterSchoolEnrolmentParams,
} from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import scheduleAfterSchoolProgram from '../../core/schedule-after-school-program'
import { sendTermContinutationEmails } from '../../core/send-term-continutation-email'
import { unenrollAfterSchoolAppointments } from '../../core/unenroll-after-school-appointments'
import { updateAfterSchoolEnrolment } from '../../core/update-after-school-enrolment'

export const afterSchoolProgramRouter = router({
    sendTermContinuationEmails: authenticatedProcedure
        .input((input: unknown) => input as SendTermContinuationEmailsParams)
        .mutation(({ input }) => sendTermContinutationEmails(input)),
    scheduleAfterSchoolEnrolment: publicProcedure
        .input((input: unknown) => input as ScheduleAfterSchoolEnrolmentParams)
        .mutation(({ input }) => scheduleAfterSchoolProgram(input)),
    unenrollFromAfterSchoolProgram: authenticatedProcedure
        .input((input: unknown) => input as UnenrollAfterSchoolParams)
        .mutation(({ input }) => unenrollAfterSchoolAppointments(input)),
    updateAfterSchoolEnrolment: publicProcedure
        .input((input: unknown) => input as UpdateAfterSchoolEnrolmentParams)
        .mutation(({ input }) => updateAfterSchoolEnrolment(input)),
})

export const afterSchoolProgram = onRequestTrpc(afterSchoolProgramRouter)
