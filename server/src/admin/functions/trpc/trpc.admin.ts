import { auth } from 'firebase-admin'

import { createClerkClient } from '@clerk/backend'

import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'

const clerk = createClerkClient({ secretKey: '' })

export const adminRouter = router({
    addCustomClaimToAuth: authenticatedProcedure
        .input((input: unknown) => input as { isCustomer: boolean })
        .mutation(({ input, ctx }) => {
            if (ctx.uid) {
                auth().setCustomUserClaims(ctx.uid, input)
            }
        }),
    addMetadata: authenticatedProcedure
        .input((input: unknown) => input as { id: string; orgId: string })
        .mutation(async ({ input }) => {
            const result = await clerk.invitations.createInvitation({
                ignoreExisting: true,
                emailAddress: 'ryansaffer@gmail.com',
                publicMetadata: {
                    orgs: {
                        [input.orgId]: 'test',
                    },
                    'SOME NEW': 'DATA',
                },
            })
            console.log(result)
            return result
        }),
    getUsers: publicProcedure
        .input((input: unknown) => input as { orgId: string })
        .query(async ({ input }) => {
            const allUsers = await clerk.users.getUserList()
            console.log(allUsers.data)
            return allUsers.data.filter((it) => {
                const orgs = it.publicMetadata['orgs'] as any
                if (typeof orgs === 'object') {
                    return Object.keys(orgs).includes(input.orgId)
                }
                return false
            })
        }),
})

export const admin = onRequestTrpc(adminRouter)
