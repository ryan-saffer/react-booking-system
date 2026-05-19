import { Navigate } from 'react-router-dom'

import { isFranchiseOrMaster, type Permission } from 'fizz-kidz'

import { useAuth } from '@components/Hooks/context/useAuth'

import Unauthorised from './Unauthorised'
import { useOrg } from './use-org'

import type { ReactNode } from 'react'

export function ProtectedRoute({
    permission,
    franchiseOrMaster = false,
    children,
}: {
    permission: Permission
    // Limits access to this page to only 'Corporate Studios' or a Franchise studio. Corporate studios such as 'Malvern' will redirect back to the dashboard.
    franchiseOrMaster?: boolean
    children: ReactNode
}) {
    const authUser = useAuth()
    const { hasPermission, currentOrg } = useOrg()
    if (!authUser?.uid || !currentOrg) {
        return <Navigate to="/sign-in" />
    }

    if (!hasPermission(permission)) {
        return <Unauthorised />
    }

    if (franchiseOrMaster && !isFranchiseOrMaster(currentOrg)) {
        return <Navigate to="/dashboard" />
    }

    return children
}
