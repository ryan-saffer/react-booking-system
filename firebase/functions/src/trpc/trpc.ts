import { z } from 'zod'

import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

export const birthdayParties = router({
    firstRouterFunctionOne: publicProcedure
        .use(({ path, next, ctx }) => {
            console.log('path:', path)
            console.log('context:', ctx)
            return next()
        })
        // .input(
        //     z.object({
        //         name: z.string(),
        //     })
        // )
        .query(() => {
            console.log('running first router greeting!')
            console.log(`Hello!`)
            return { first: 'trpc response for first function' }
        }),
})
export const holidayPrograms = router({
    secondRouterFunctionOne: publicProcedure
        .input(
            z.object({
                ryan: z.string(),
            })
        )
        .mutation((data) => {
            console.log('running second router second greeting!')
            console.log(data.input.ryan)
            return { youSentMe: data.input.ryan }
        }),
    secondFouterFunctionTwo: publicProcedure.query(() => 3),
})

const appRouter = router({
    birthdayParties,
    holidayPrograms,
})
export type AppRouter = typeof appRouter
