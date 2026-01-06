import type { Permission, Role, StudioOrMaster } from 'fizz-kidz'
import { ObjectKeys } from 'fizz-kidz'
import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'
import { checkRoleForPermission } from '@constants/permissions'

export const OrgContext = createContext<{
    availableOrgs: StudioOrMaster[] | null
    switchToOrg: (org: StudioOrMaster) => void
    currentOrg: StudioOrMaster | null
    role: Role | null
    hasPermission: (permission: Permission) => boolean
}>({ availableOrgs: null, currentOrg: null, switchToOrg: () => {}, role: null, hasPermission: () => false })

export function OrgProvider({ children }: { children: ReactNode }) {
    const user = useAuth()

    const [availableOrgs, setAvailableOrgs] = useState<StudioOrMaster[] | null>(null)

    const cachedOrg = localStorage.getItem('selectedOrg')
    const [currentOrg, setCurrentOrg] = useState<StudioOrMaster | null>(
        cachedOrg ? (cachedOrg as StudioOrMaster) : null
    )

    const getRole = useCallback(
        (org: StudioOrMaster | null) => {
            if (user?.accountType === 'staff' && org) {
                return user.roles?.[org] || null
            }
            return null
        },
        [user]
    )

    const [role, setRole] = useState<Role | null>(getRole(currentOrg))

    const hasPermission = useCallback(
        (permission: Permission) => {
            return checkRoleForPermission(role, permission)
        },
        [role]
    )

    const switchToOrg = useCallback(
        (org: StudioOrMaster) => {
            setCurrentOrg(org)
            localStorage.setItem('selectedOrg', org)
            setRole(getRole(org))
        },
        [getRole]
    )

    useEffect(() => {
        if (user?.accountType === 'staff') {
            const availableOrgs = ObjectKeys(user.roles || {})
            if (availableOrgs.length > 0) {
                setAvailableOrgs(availableOrgs)
                setRole(getRole(currentOrg))

                if (!currentOrg) {
                    switchToOrg(availableOrgs[0])
                }

                return
            }
        }

        // accountType is customer, or staff has not been added to any orgs.
        setAvailableOrgs(null)
        setRole(null)
        setCurrentOrg(null)
        localStorage.removeItem('selectedOrg')
    }, [user, currentOrg, getRole, switchToOrg])

    return (
        <OrgContext
            value={{
                availableOrgs,
                currentOrg,
                switchToOrg,
                role,
                hasPermission,
            }}
        >
            {children}
        </OrgContext>
    )
}
