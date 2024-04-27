import { getAuth } from 'firebase-admin/auth'
import { LocationOrMaster, ObjectKeys, Role, StaffAuthUser } from 'fizz-kidz'

import { TRPCError } from '@trpc/server'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function addUserToStudio({
    email,
    role,
    studio,
}: {
    email: string
    role: Role
    studio: LocationOrMaster
}) {
    const auth = getAuth()

    try {
        const user = await auth.getUserByEmail(email)

        let dbUser = await DatabaseClient.getUser(user.uid)

        if (!dbUser) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `User with email '${email}' found in auth, but not found in database.`,
            })
        }

        if (dbUser.accountType === 'customer') {
            // if the user already has a customer account, convert them to a staff account.
            await DatabaseClient.updateUser(dbUser.uid, { ...user, accountType: 'staff' })
        }

        // guaranteed to be a staff account at this point, cast it for types
        dbUser = dbUser as StaffAuthUser

        if (ObjectKeys(dbUser.roles).includes(studio)) {
            // user already assigned to this studio
            return 'exists'
        } else {
            // add user to this studio
            const prevRoles = dbUser.roles
            await DatabaseClient.updateUser(dbUser.uid, {
                ...dbUser,
                roles: { ...prevRoles, [studio]: role },
            })
        }
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            // create the user
            const newUser = await auth.createUser({
                email,
                emailVerified: false,
            })

            // add them to db
            await DatabaseClient.createUser(newUser.uid, {
                accountType: 'staff',
                email,
                imageUrl: null,
                roles: {
                    [studio]: role,
                },
                uid: newUser.uid,
            })
        } else {
            throw err
        }
    }
}
