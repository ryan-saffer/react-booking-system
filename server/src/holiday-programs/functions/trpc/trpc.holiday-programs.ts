import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { checkDiscountCode } from '../../core/discount-codes/check-discount-code'
import type { CreateDiscountCode } from '../../core/discount-codes/create-discount-code'
import { createDiscountCode } from '../../core/discount-codes/create-discount-code'
import type { CreateDiscountCodeFromInvitation } from '../../core/discount-codes/create-discount-code-from-invitation'
import { createDiscountCodeFromInvitation } from '../../core/discount-codes/create-discount-code-from-invitation'
import { bookHolidayProgram, type HolidayProgramBookingProps } from '../../core/book-holiday-program'

export const holidayProgramsRouter = router({
    bookHolidayProgram: publicProcedure
        .input((input) => input as HolidayProgramBookingProps)
        .mutation(({ input }) => bookHolidayProgram(input)),
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
