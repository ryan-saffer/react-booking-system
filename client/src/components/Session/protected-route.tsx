import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@components/Hooks/context/useAuth'
import { ROLES, Role } from '@constants/roles'
import { SIGN_IN } from '@constants/routes'

import Unauthorised from './Unauthorised'

export const ProtectedRoute = ({ roles, children }: PropsWithChildren<{ roles: Role[] }>) => {
    const authUser = useAuth()
    if (!authUser) {
        return <Navigate to={SIGN_IN} replace />
    }

    if (!authUser.role || !ROLES.includes(authUser.role)) {
        return <Unauthorised showLogout />
    }

    if (authUser.role === 'ADMIN')
        // admin is allowed to view all pages
        return children

    // empty roles means any authenticated user can view it
    if (roles.length === 0) {
        return children
    }

    // otherwise check if the current user has the specified role
    if (roles.includes(authUser.role)) return children

    return <Unauthorised />
}
