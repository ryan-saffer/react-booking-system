import { Permission } from 'fizz-kidz'
import { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useAuth } from '@components/Hooks/context/useAuth'

import Unauthorised from './Unauthorised'
import { useOrg } from './use-org'

export function ProtectedRoute({ permission, children }: { permission: Permission; children: ReactNode }) {
    const authUser = useAuth()
    const { hasPermission } = useOrg()
    if (!authUser) {
        return <Navigate to="/sign-in" />
    }

    if (hasPermission(permission)) {
        return children
    } else {
        return <Unauthorised />
    }
}
