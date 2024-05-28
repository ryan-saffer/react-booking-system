import { FreeHolidayProgramBooking } from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { checkDiscountCode } from '../../core/check-discount-code'
import { CreateDiscountCode, createDiscountCode } from '../../core/create-discount-code'
import {
    CreateDiscountCodeFromInvitation,
    createDiscountCodeFromInvitation,
} from '../../core/create-discount-code-from-invitation'
import { bookHolidayPrograms } from '../../core/schedule-holiday-programs'

export const holidayProgramsRouter = router({
    scheduleFreeHolidayPrograms: publicProcedure
        .input((input: unknown) => input as FreeHolidayProgramBooking[])
        .mutation(async ({ input }) =>
            bookHolidayPrograms({
                free: true,
                programs: input,
            })
        ),
    createDiscountCode: authenticatedProcedure
        .input((input: unknown) => input as CreateDiscountCode)
        .mutation(({ input }) => createDiscountCode(input)),
    createDiscountCodeFromInvitation: publicProcedure
        .input((input: unknown) => input as CreateDiscountCodeFromInvitation)
        .mutation(({ input }) => createDiscountCodeFromInvitation(input)),
    checkDiscountCode: publicProcedure
        .input((input: unknown) => input as { code: string })
        .mutation(({ input }) => checkDiscountCode(input.code)),
})

export const holidayPrograms = onRequestTrpc(holidayProgramsRouter)
