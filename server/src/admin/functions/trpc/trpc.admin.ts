import { getAuth } from 'firebase-admin/auth'
import { AuthUser, LocationOrMaster, Role, StaffAuthUser } from 'fizz-kidz'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { authenticatedProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { addUserToStudio } from '../../core/add-user-to-studio'

export const adminRouter = router({
    addCustomClaimToAuth: authenticatedProcedure
        .input((input: unknown) => input as { uid: string; isCustomer: boolean })
        .mutation(({ input }) => {
            getAuth().setCustomUserClaims(input.uid, input)
        }),
    createUser: authenticatedProcedure
        .input((input: unknown) => input as AuthUser)
        .mutation(({ input }) => DatabaseClient.createUser(input.uid, input)),
    getUsers: authenticatedProcedure
        .input((input: unknown) => input as { studio: LocationOrMaster | null })
        .query(async ({ input }) => {
            if (!input.studio) return []
            const users = await DatabaseClient.getUsersByStudio(input.studio)
            return users as StaffAuthUser[]
        }),
    updateUserRole: authenticatedProcedure
        .input((input: unknown) => input as { uid: string; studio: LocationOrMaster; role: Role })
        .mutation(({ input }) => DatabaseClient.updateUser(input.uid, { roles: { [input.studio]: input.role } })),
    addUserToStudio: authenticatedProcedure
        .input((input: unknown) => input as { email: string; role: Role; studio: LocationOrMaster })
        .mutation(({ input }) => addUserToStudio(input)),
})

export const admin = onRequestTrpc(adminRouter)
