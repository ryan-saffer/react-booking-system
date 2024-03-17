import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { Protect, useUser } from '@clerk/clerk-react'
import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'
import { ROLES, Role } from '@constants/roles'

import Unauthorised from './Unauthorised'

export const ProtectedRoute = ({
    roles,
    permission,
    children,
}: PropsWithChildren<{ roles: Role[]; permission?: string }>) => {
    const authUser = useAuth()
    const { user } = useUser()
    console.log('authUser', authUser)
    console.log('user', user)
    if (!authUser && !user) {
        console.log('navigating to sign in')
        return <Navigate to="../sign-in" />
    }

    if (user && !authUser) {
        return <Loader />
    }

    return (
        <Protect permission={permission || 'org:dashboard:view'} fallback={<Unauthorised />}>
            {children}
        </Protect>
    )

    // if (!authUser.role || !ROLES.includes(authUser.role)) {
    //     return <Unauthorised showLogout />
    // }

    // if (authUser.role === 'ADMIN')
    //     // admin is allowed to view all pages
    //     return children

    // // empty roles means any authenticated user can view it
    // if (roles.length === 0) {
    //     return children
    // }

    // // otherwise check if the current user has the specified role
    // if (roles.includes(authUser.role)) return children

    // return <Unauthorised />
}
