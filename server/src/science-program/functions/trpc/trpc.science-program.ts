import {
    ScheduleScienceAppointmentParams,
    SendTermContinuationEmailsParams,
    UnenrollScienceAppointmentsParams,
    UpdateScienceEnrolmentParams,
} from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import scheduleScienceProgram from '../../core/schedule-science-program'
import { sendTermContinutationEmails } from '../../core/send-term-continutation-email'
import { unenrollScienceAppointments } from '../../core/unenroll-science-appointments'
import { updateScienceEnrolment } from '../../core/update-science-enrolment'

export const scienceProgramRouter = router({
    sendTermContinuationEmails: authenticatedProcedure
        .input((input: unknown) => input as SendTermContinuationEmailsParams)
        .mutation(({ input }) => sendTermContinutationEmails(input)),
    scheduleScienceAppointment: publicProcedure
        .input((input: unknown) => input as ScheduleScienceAppointmentParams)
        .mutation(({ input }) => scheduleScienceProgram(input)),
    unenrollScienceAppointments: authenticatedProcedure
        .input((input: unknown) => input as UnenrollScienceAppointmentsParams)
        .mutation(({ input }) => unenrollScienceAppointments(input)),
    updateScienceEnrolment: publicProcedure
        .input((input: unknown) => input as UpdateScienceEnrolmentParams)
        .mutation(({ input }) => updateScienceEnrolment(input)),
})

export const scienceProgram = onRequestTrpc(scienceProgramRouter)
