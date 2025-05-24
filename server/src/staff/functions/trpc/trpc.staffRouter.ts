import type { GenerateTimesheetsParams, InitiateEmployeeProps } from 'fizz-kidz'

import { authenticatedProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { initiateOnboarding } from '../../core/onboarding/initiate-onboarding'
import { generateTimesheets } from '../../core/timesheets/generate-timesheets'

export const staffRouter = router({
    generateTimesheets: authenticatedProcedure
        .input((input: unknown) => input as GenerateTimesheetsParams)
        .mutation(({ input }) => generateTimesheets(input)),
    initiateOnboarding: authenticatedProcedure
        .input((input: unknown) => input as InitiateEmployeeProps)
        .mutation(({ input }) => initiateOnboarding(input)),
})

export const staff = onRequestTrpc(staffRouter)
