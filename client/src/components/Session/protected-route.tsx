import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { Protect, useUser } from '@clerk/clerk-react'
import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'

import Unauthorised from './Unauthorised'

interface PermissionProps {
    permission: string
    role?: never
}

interface RoleProps {
    role: string
    permission?: never
}

interface NoProps {
    permission?: never
    role?: never
}

type Props = PermissionProps | RoleProps | NoProps

export const ProtectedRoute = ({ permission, role, children }: PropsWithChildren<Props>) => {
    const authUser = useAuth()
    const { user } = useUser()
    if (!authUser && !user) {
        return <Navigate to="/sign-in" />
    }

    if (user && !authUser) {
        return <Loader />
    }

    return children

    if (permission) {
        return (
            <Protect permission={permission} fallback={<Unauthorised />}>
                {children}
            </Protect>
        )
    }

    if (role) {
        return (
            <Protect role={role} fallback={<Unauthorised />}>
                {children}
            </Protect>
        )
    }

    return (
        <Protect permission="org:dashboard:view" fallback={<Unauthorised />}>
            {children}
        </Protect>
    )
}
