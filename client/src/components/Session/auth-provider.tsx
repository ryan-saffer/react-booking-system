import { ReactNode, useEffect, useState } from 'react'

import { useAuth, useUser } from '@clerk/clerk-react'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { trpc } from '@utils/trpc'

import AuthUserContext from './auth-user-context'

export type AuthUser = {
    uid: string
    email: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { getToken, orgRole } = useAuth()
    const { user, isLoaded } = useUser()
    const firebase = useFirebase()
    const cachedUser = localStorage.getItem('authUser')
    const [authUser, setAuthUser] = useState<AuthUser | null>(cachedUser ? JSON.parse(cachedUser) : null)

    const addCustomClaimToAuth = trpc.admin.addCustomClaimToAuth.useMutation()

    useEffect(() => {
        async function signInOrOut() {
            // once clerk has loaded, check if there is a logged in user
            if (user) {
                // if there is, get the user token, and sign in to firebase
                const token = await getToken({ template: 'integration_firebase' })
                if (token) {
                    const firebaseUser = await firebase.auth.signInWithCustomToken(token)

                    // in order to protect firestore, the security rule 'request.auth.uid != null' is insufficient.
                    // Since anyone, such as customers, can create accounts, we need to lock down firestore to only
                    // members with access to an organization.

                    // start by checking if the user has an org role.
                    const hasOrgRole = !!orgRole

                    // this function uses the admin sdk to add a custom claim to the users auth session.
                    // read more about custom claims here: https://firebase.google.com/docs/auth/admin/custom-claims
                    await addCustomClaimToAuth.mutateAsync({ isCustomer: !hasOrgRole })

                    // once this has worked, force refresh the users token, to ensure it is now using the new custom claim.
                    await firebaseUser.user?.getIdToken(true)

                    // and finally, update the authUser context, so the app will know that firebase login is complete.
                    const authUser = {
                        uid: firebaseUser.user!.uid,
                        email: user.primaryEmailAddress!.emailAddress,
                    }
                    setAuthUser(authUser)
                    localStorage.setItem('authUser', JSON.stringify(authUser))
                }
            } else {
                // if the clerk user is not logged in, be sure to also sign out of firebase.
                await firebase.doSignOut()
                setAuthUser(null)
            }
        }
        if (isLoaded) {
            signInOrOut()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>
}
