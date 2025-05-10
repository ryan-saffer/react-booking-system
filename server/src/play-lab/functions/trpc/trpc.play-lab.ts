import { publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { bookPlayLab, type BookPlayLabProps } from '../../core/book-play-lab'

export const playLabRouter = router({
    book: publicProcedure.input((input) => input as BookPlayLabProps).mutation(({ input }) => bookPlayLab(input)),
})

export const playLab = onRequestTrpc(playLabRouter)
