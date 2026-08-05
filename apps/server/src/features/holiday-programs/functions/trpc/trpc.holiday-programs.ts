import { publicProcedure, authenticatedProcedure, router } from '@/app/trpc/trpc'
import { ANAPHYLAXIS_PLAN_PREFIXES } from '@/features/anaphylaxis-plans/anaphylaxis-plan-path'
import { getAnaphylaxisPlanUrl } from '@/features/anaphylaxis-plans/get-anaphylaxis-plan-url'
import { checkGiftCardBalance } from '@/features/gift-cards/check-gift-card-balance'
import {
    type HolidayProgramBookingProps,
    bookHolidayProgram,
} from '@/features/holiday-programs/core/book-holiday-program'
import { checkDiscountCode } from '@/features/holiday-programs/core/discount-codes/check-discount-code'
import {
    type CreateDiscountCode,
    createDiscountCode,
} from '@/features/holiday-programs/core/discount-codes/create-discount-code'
import {
    type CreateDiscountCodeFromInvitation,
    createDiscountCodeFromInvitation,
} from '@/features/holiday-programs/core/discount-codes/create-discount-code-from-invitation'

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
        .input((input: unknown) => input as { code: string; customerEmail?: string })
        .mutation(({ input }) => checkDiscountCode(input.code, input.customerEmail)),
    checkGiftCardBalance: publicProcedure
        .input((input: unknown) => input as { giftCardNumber: string })
        .mutation(({ input }) => checkGiftCardBalance(input.giftCardNumber)),
    getAnaphylaxisPlanUrl: authenticatedProcedure
        .input((input: unknown) => input as { anaphylaxisPlanUrl: string })
        .mutation(({ input }) =>
            getAnaphylaxisPlanUrl(input.anaphylaxisPlanUrl, ANAPHYLAXIS_PLAN_PREFIXES.HOLIDAY_PROGRAM)
        ),
})
