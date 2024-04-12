import { ReactNode, useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

import AuthUserContext from './auth-user-context'
import { trpc } from '@utils/trpc'
import { AuthUser } from 'fizz-kidz'

export function AuthProvider({ children }: { children: ReactNode }) {
    const firebase = useFirebase()
    const cachedUser = localStorage.getItem('authUser')
    const [authUser, setAuthUser] = useState<(AuthUser & { jwt: string; uid: string }) | null>(
        cachedUser ? JSON.parse(cachedUser) : null
    )

    const addCustomClaim = trpc.admin.addCustomClaimToAuth.useMutation()

    useEffect(() => {
        let unsubDb = () => {}

        const unsubAuth = firebase.auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // get the user from the db
                unsubDb = firebase.db
                    .collection('users')
                    .doc(authUser.uid)
                    .onSnapshot(async (snap) => {
                        if (snap.exists) {
                            const user = snap.data() as AuthUser
                            if (!user.imageUrl) {
                                user.imageUrl = authUser.photoURL
                            }

                            // include the jwt and uid in the cache, since when loading the app, authStateChanged can take a moment to trigger,
                            // and requests to the server can happen in the meantime. Caching it can allow it to be used in the interim.
                            const jwt = await authUser.getIdToken(false)
                            const uid = authUser.uid
                            setAuthUser({ ...user, jwt, uid })
                            localStorage.setItem('authUser', JSON.stringify({ ...user, jwt, uid }))

                            // in order to protect firestore, the security rule 'request.auth.uid != null' is insufficient.
                            // Since anyone, such as customers, can create accounts, we need to lock down firestore to only staff members.

                            // add a custom claim to the auth object. Read more: https://firebase.google.com/docs/auth/admin/custom-claims
                            await addCustomClaim.mutateAsync({
                                uid: authUser.uid,
                                isCustomer: user.accountType !== 'staff',
                            })
                        } else {
                            // user doesn't exist in db, which means they were not invited to the platform.
                            // default them as a customer.
                            // once created, it will fire this snapshot again, and will then correctly be found
                            const newUser = {
                                uid: authUser.uid,
                                email: authUser.email!,
                                imageUrl: authUser.photoURL,
                                accountType: 'customer',
                            } satisfies AuthUser
                            firebase.db.collection('users').doc(authUser.uid).set(newUser)
                        }
                    })
            } else {
                setAuthUser(null)
                localStorage.removeItem('authUser')
            }
        })

        return () => {
            unsubDb()
            unsubAuth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>
}
