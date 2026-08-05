import { publicProcedure, router } from '@/app/trpc/trpc'
import { checkGiftCardBalance } from '@/features/gift-cards/check-gift-card-balance'
import { type BookPlayLabProps, bookPlayLab } from '@/features/play-lab/core/book-play-lab'

export const playLabRouter = router({
    book: publicProcedure.input((input) => input as BookPlayLabProps).mutation(({ input }) => bookPlayLab(input)),
    checkGiftCardBalance: publicProcedure
        .input((input: unknown) => input as { giftCardNumber: string })
        .mutation(({ input }) => checkGiftCardBalance(input.giftCardNumber)),
})
