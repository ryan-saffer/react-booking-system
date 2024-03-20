import { auth } from 'firebase-admin'

import { authenticatedProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'

export const adminRouter = router({
    addCustomClaimToAuth: authenticatedProcedure
        .input((input: unknown) => input as { isCustomer: boolean })
        .mutation(({ input, ctx }) => {
            if (ctx.uid) {
                auth().setCustomUserClaims(ctx.uid, input)
            }
        }),
})

export const admin = onRequestTrpc(adminRouter)
