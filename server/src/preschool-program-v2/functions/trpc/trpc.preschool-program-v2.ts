import { checkGiftCardBalance } from '@/gift-cards/check-gift-card-balance'
import {
    bookPreschoolProgramV2,
    type BookPreschoolProgramV2Props,
} from '@/preschool-program-v2/core/book-preschool-program-v2'
import { publicProcedure, router } from '@/trpc/trpc'

export const preschoolProgramV2Router = router({
    book: publicProcedure
        .input((input: unknown) => input as BookPreschoolProgramV2Props)
        .mutation(({ input }) => bookPreschoolProgramV2(input)),
    checkGiftCardBalance: publicProcedure
        .input((input: unknown) => input as { giftCardNumber: string })
        .mutation(({ input }) => checkGiftCardBalance(input.giftCardNumber)),
})
