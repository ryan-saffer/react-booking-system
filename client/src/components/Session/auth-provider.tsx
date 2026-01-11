import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

import AuthUserContext from './auth-user-context'
import { useTRPC } from '@utils/trpc'
import type { AuthUser } from 'fizz-kidz'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

import { useMutation } from '@tanstack/react-query'

export function AuthProvider({ children }: { children: ReactNode }) {
    const trpc = useTRPC()
    const firebase = useFirebase()
    const cachedUser = localStorage.getItem('authUser')
    const [authUser, setAuthUser] = useState<(AuthUser & { jwt: string; uid: string }) | null>(
        cachedUser ? JSON.parse(cachedUser) : null
    )

    const { mutateAsync: createUser } = useMutation(trpc.auth.createUser.mutationOptions())

    useEffect(() => {
        let unsubDb = () => {}

        const unsubAuth = onAuthStateChanged(firebase.auth, async (authUser) => {
            if (authUser) {
                // get the user from the db
                const userRef = doc(firebase.db, 'users', authUser.uid)
                unsubDb = onSnapshot(
                    userRef,
                    async (snap) => {
                        if (snap.exists()) {
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
                        } else {
                            // user doesn't exist in db, which means they were not invited to the platform, so default them as a customer.
                            // once created, it will fire this snapshot again, and will then correctly be found
                            const newUser = {
                                uid: authUser.uid,
                                email: authUser.email!, // all login options must include an email, so this will exist
                                imageUrl: authUser.photoURL,
                                accountType: 'customer',
                                firstname: authUser.displayName || '',
                            } satisfies AuthUser

                            // users are only given read access to their user document in firestore, and must update/create their doc
                            // through the backend (to avoid giving themselves admin privileges).
                            // however.. createUser is an authenticated procedure, and we have not yet set the authUser..
                            // so we just set the jwt in the cache here to allow calling this endpoint.
                            const jwt = await authUser.getIdToken(false)
                            localStorage.setItem('authUser', JSON.stringify({ jwt }))

                            await createUser(newUser)
                        }
                    },
                    (error) => console.error(error)
                )
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

    return <AuthUserContext value={authUser}>{children}</AuthUserContext>
}
