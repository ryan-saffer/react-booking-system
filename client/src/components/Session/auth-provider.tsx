import { ReactNode, useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Role } from '@constants/roles'

import AuthUserContext from './auth-user-context'

// models what is stored in firestore
type DbUser = {
    email: string
    role: Role
}

// the combined authuser provided through context to the entire app
type AuthUser = {
    uid: string
    email: string
    role: Role
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const firebase = useFirebase()
    const cachedUser = localStorage.getItem('authUser')
    const [authUser, setAuthUser] = useState<AuthUser | null>(cachedUser ? JSON.parse(cachedUser) : null)

    useEffect(() => {
        let unsubDb = () => {}
        const unsubAuthState = firebase.auth.onAuthStateChanged(async (auth) => {
            if (auth) {
                unsubDb = firebase.db.doc(`users/${auth.uid}`).onSnapshot((dbUserSnap) => {
                    let authUser: AuthUser
                    if (dbUserSnap.exists) {
                        const dbUser = dbUserSnap.data() as DbUser
                        authUser = { uid: auth.uid, email: auth.email!, role: dbUser.role }
                    } else {
                        authUser = { uid: auth.uid, email: auth.email!, role: 'RESTRICTED' }
                    }
                    setAuthUser(authUser)
                    localStorage.setItem('authUser', JSON.stringify(authUser))
                })
            } else {
                setAuthUser(null)
            }
        })

        return () => {
            unsubDb()
            unsubAuthState()
        }
    }, [firebase])

    return <AuthUserContext.Provider value={authUser}>{children}</AuthUserContext.Provider>
}
