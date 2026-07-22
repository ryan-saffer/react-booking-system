import { ANAPHYLAXIS_PLAN_PREFIXES } from '@/anaphylaxis-plans/anaphylaxis-plan-path'
import { getAnaphylaxisPlanUrl } from '@/anaphylaxis-plans/get-anaphylaxis-plan-url'
import { checkGiftCardBalance } from '@/gift-cards/check-gift-card-balance'
import {
    bookPreschoolProgramV2,
    type BookPreschoolProgramV2Props,
} from '@/preschool-program-v2/core/book-preschool-program-v2'
import { authenticatedProcedure, publicProcedure, router } from '@/trpc/trpc'

export const preschoolProgramV2Router = router({
    book: publicProcedure
        .input((input: unknown) => input as BookPreschoolProgramV2Props)
        .mutation(({ input }) => bookPreschoolProgramV2(input)),
    checkGiftCardBalance: publicProcedure
        .input((input: unknown) => input as { giftCardNumber: string })
        .mutation(({ input }) => checkGiftCardBalance(input.giftCardNumber)),
    getAnaphylaxisPlanUrl: authenticatedProcedure
        .input((input: unknown) => input as { storagePath: string })
        .mutation(({ input }) =>
            getAnaphylaxisPlanUrl(input.storagePath, ANAPHYLAXIS_PLAN_PREFIXES.PRESCHOOL_PROGRAM_V2)
        ),
})
