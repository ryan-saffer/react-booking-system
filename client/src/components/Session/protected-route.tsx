import { Navigate } from 'react-router-dom'

import type { Permission } from 'fizz-kidz'

import { useAuth } from '@components/Hooks/context/useAuth'

import Unauthorised from './Unauthorised'
import { useOrg } from './use-org'

import type { ReactNode } from 'react'

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
