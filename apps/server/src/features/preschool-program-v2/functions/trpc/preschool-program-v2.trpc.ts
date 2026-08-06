import { authenticatedProcedure, publicProcedure, router } from '@/app/trpc/trpc'
import { ANAPHYLAXIS_PLAN_PREFIXES } from '@/features/anaphylaxis-plans/anaphylaxis-plan-path'
import { getAnaphylaxisPlanUrl } from '@/features/anaphylaxis-plans/get-anaphylaxis-plan-url'
import { checkGiftCardBalance } from '@/features/gift-cards/check-gift-card-balance'
import {
    bookPreschoolProgramV2,
    type BookPreschoolProgramV2Props,
} from '@/features/preschool-program-v2/core/book-preschool-program-v2'

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
