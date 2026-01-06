import type { Permission, Role, StudioOrMaster } from 'fizz-kidz'
import { ObjectKeys } from 'fizz-kidz'
import type { ReactNode } from 'react'
import { createContext, useEffect, useState } from 'react'

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

    const [selectedOrg, setSelectedOrg] = useState<StudioOrMaster | null>(() => {
        const cachedOrg = localStorage.getItem('selectedOrg')
        return cachedOrg ? (cachedOrg as StudioOrMaster) : null
    })

    const availableOrgs = (() => {
        if (user?.accountType !== 'staff' || !user.roles) return null
        const orgs = ObjectKeys(user.roles)
        return orgs.length > 0 ? orgs : null
    })()

    const currentOrg = (() => {
        if (!availableOrgs || availableOrgs.length === 0) return null
        if (selectedOrg && availableOrgs.includes(selectedOrg)) return selectedOrg
        return availableOrgs[0]
    })()

    const role = user?.accountType === 'staff' && currentOrg ? user.roles?.[currentOrg] || null : null

    const hasPermission = (permission: Permission) => {
        return checkRoleForPermission(role, permission)
    }

    const switchToOrg = (org: StudioOrMaster) => {
        setSelectedOrg(org)
        localStorage.setItem('selectedOrg', org)
    }

    useEffect(() => {
        if (!currentOrg) {
            localStorage.removeItem('selectedOrg')
            return
        }

        if (currentOrg !== selectedOrg) {
            localStorage.setItem('selectedOrg', currentOrg)
        }
    }, [currentOrg, selectedOrg])

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
