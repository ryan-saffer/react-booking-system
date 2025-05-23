import { FreeHolidayProgramBooking } from 'fizz-kidz'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { checkDiscountCode } from '../../core/discount-codes/check-discount-code'
import { CreateDiscountCode, createDiscountCode } from '../../core/discount-codes/create-discount-code'
import {
    CreateDiscountCodeFromInvitation,
    createDiscountCodeFromInvitation,
} from '../../core/discount-codes/create-discount-code-from-invitation'
import { bookHolidayPrograms } from '../../core/schedule-holiday-programs'
import { bookHolidayProgramNew, type HolidayProgramBookingProps } from '../../core/book-holiday-program-new'

export const holidayProgramsRouter = router({
    scheduleFreeHolidayPrograms: publicProcedure
        .input((input: unknown) => input as FreeHolidayProgramBooking[])
        .mutation(async ({ input }) =>
            bookHolidayPrograms({
                free: true,
                programs: input,
            })
        ),
    bookHolidayProgram: publicProcedure
        .input((input) => input as HolidayProgramBookingProps)
        .mutation(({ input }) => bookHolidayProgramNew(input)),
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
