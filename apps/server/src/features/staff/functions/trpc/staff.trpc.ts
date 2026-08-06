import type { GenerateTimesheetsParams, InitiateEmployeeProps } from '@fizz-kidz/core'

import { initiateOnboarding } from '../../core/onboarding/initiate-onboarding'
import { generateTimesheets } from '../../core/timesheets/generate-timesheets'

import { authenticatedProcedure, router } from '@/app/trpc/trpc'

export const staffRouter = router({
    generateTimesheets: authenticatedProcedure
        .input((input: unknown) => input as GenerateTimesheetsParams)
        .mutation(({ input }) => generateTimesheets(input)),
    initiateOnboarding: authenticatedProcedure
        .input((input: unknown) => input as InitiateEmployeeProps)
        .mutation(({ input }) => initiateOnboarding(input)),
})
