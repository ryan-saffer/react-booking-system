import { FieldValue } from 'firebase-admin/firestore'
import { AuthUser, LocationOrMaster, Role, StaffAuthUser } from 'fizz-kidz'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { authenticatedProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { addUserToStudio } from '../../core/add-user-to-studio'

export const authRouter = router({
    createUser: authenticatedProcedure
        .input((input: unknown) => input as AuthUser)
        .mutation(({ input }) => DatabaseClient.createUser(input.uid, input)),
    updateProfile: authenticatedProcedure
        .input((input: unknown) => input as { firstname: string; lastname: string })
        .mutation(({ ctx, input }) => DatabaseClient.updateUser(ctx.uid, input)),
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
        .input(
            (input: unknown) =>
                input as { firstname: string; lastname: string; email: string; role: Role; studio: LocationOrMaster }
        )
        .mutation(({ input }) => addUserToStudio(input)),
    removeUserFromStudio: authenticatedProcedure
        .input((input: unknown) => input as { uid: string; studio: LocationOrMaster })
        .mutation(async ({ input }) => {
            DatabaseClient.updateUser(input.uid, { roles: { [input.studio]: FieldValue.delete() } })

            // if the user is now no longer a member of any studios, then delete the roles object and set them back to a customer account.
            const user = await DatabaseClient.getUser(input.uid)
            if (user?.accountType === 'staff') {
                if (user.roles && Object.keys(user.roles).length === 0) {
                    await DatabaseClient.updateUser(input.uid, {
                        ...user,
                        accountType: 'customer',
                        roles: FieldValue.delete(),
                    })
                }
            }
        }),
})

export const auth = onRequestTrpc(authRouter)
