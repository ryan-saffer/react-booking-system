import { type HolidayProgramBookingProps, bookHolidayProgram } from '@/holiday-programs/core/book-holiday-program'
import { checkDiscountCode } from '@/holiday-programs/core/discount-codes/check-discount-code'
import {
    type CreateDiscountCode,
    createDiscountCode,
} from '@/holiday-programs/core/discount-codes/create-discount-code'
import {
    type CreateDiscountCodeFromInvitation,
    createDiscountCodeFromInvitation,
} from '@/holiday-programs/core/discount-codes/create-discount-code-from-invitation'
import { publicProcedure, authenticatedProcedure, router } from '@/trpc/trpc'

export const holidayProgramsRouter = router({
    book: publicProcedure
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
