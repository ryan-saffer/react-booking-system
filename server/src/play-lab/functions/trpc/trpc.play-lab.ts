import { type BookPlayLabProps, bookPlayLab } from '@/play-lab/core/book-play-lab'
import { publicProcedure, router } from '@/trpc/trpc'

export const playLabRouter = router({
    book: publicProcedure.input((input) => input as BookPlayLabProps).mutation(({ input }) => bookPlayLab(input)),
})
