import { ReactNode, useEffect, useState } from 'react'

import { useAuth, useUser } from '@clerk/clerk-react'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { Role } from '@constants/roles'

import AuthUserContext from './auth-user-context'

// the combined authuser provided through context to the entire app
export type AuthUser = {
    uid: string
    email: string
    firstName: string
    lastName: string
    // role: Role
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth()
    const { user, isLoaded } = useUser()
    const firebase = useFirebase()
    const cachedUser = localStorage.getItem('authUser')
    const [authUser, setAuthUser] = useState<AuthUser | null>(cachedUser ? JSON.parse(cachedUser) : null)

    useEffect(() => {
        async function signInOrOut() {
            if (user) {
                const token = await getToken({ template: 'integration_firebase' })
                if (token) {
                    console.log('signing in to firebase')
                    const firebaseUser = await firebase.auth.signInWithCustomToken(token)

                    const authUser = {
                        uid: firebaseUser.user!.uid,
                        email: user.primaryEmailAddress!.emailAddress,
                        firstName: user.firstName!,
                        lastName: user.lastName!,
                    }
                    setAuthUser(authUser)
                    localStorage.setItem('authUser', JSON.stringify(authUser))
                }
            } else {
                console.log('signing out of firebase')
                firebase.doSignOut()
                setAuthUser(null)
            }
        }
        if (isLoaded) {
            signInOrOut()
        }
    }, [firebase, getToken, user])

    // useEffect(() => {
    //     console.log('isLoaded:', isLoaded)
    //     console.log('user updated!', { user })
    // }, [user, isLoaded])

    // useEffect(() => {
    //     let unsubDb = () => {}
    //     const unsubAuthState = firebase.auth.onAuthStateChanged(async (auth) => {
    //         if (auth) {
    //             unsubDb = firebase.db.doc(`users/${auth.uid}`).onSnapshot((dbUserSnap) => {
    //                 let authUser: AuthUser
    //                 if (dbUserSnap.exists) {
    //                     const dbUser = dbUserSnap.data() as AuthUser
    //                     authUser = {
    //                         uid: auth.uid,
    //                         email: auth.email!,
    //                         role: dbUser.role,
    //                         firstName: dbUser.firstName,
    //                         lastName: dbUser.lastName,
    //                     }
    //                 } else {
    //                     authUser = {
    //                         uid: auth.uid,
    //                         email: auth.email!,
    //                         role: 'RESTRICTED',
    //                         firstName: '',
    //                         lastName: '',
    //                     }
    //                 }
    //                 setAuthUser(authUser)
    //                 localStorage.setItem('authUser', JSON.stringify(authUser))
    //             })
    //         } else {
    //             setAuthUser(null)
    //         }
    //     })

    //     return () => {
    //         unsubDb()
    //         unsubAuthState()
    //     }
    // }, [firebase])

    return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>
}
