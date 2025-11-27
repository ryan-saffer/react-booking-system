import { checkGiftCardBalance } from '@/gift-cards/check-gift-card-balance'
import { type BookPlayLabProps, bookPlayLab } from '@/play-lab/core/book-play-lab'
import { publicProcedure, router } from '@/trpc/trpc'

export const playLabRouter = router({
    book: publicProcedure.input((input) => input as BookPlayLabProps).mutation(({ input }) => bookPlayLab(input)),
    checkGiftCardBalance: publicProcedure
        .input((input: unknown) => input as { giftCardNumber: string })
        .mutation(({ input }) => checkGiftCardBalance(input.giftCardNumber)),
})
