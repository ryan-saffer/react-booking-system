import { Location, ObjectKeys } from 'fizz-kidz'
import { ReactNode, createContext, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'
import { Permission, checkRoleForPermission } from '@constants/permissions'
import { Role } from '@constants/roles'

export type LocationOrMaster = Location | 'master'

export const OrgContext = createContext<{
    availableOrgs: LocationOrMaster[] | null
    switchToOrg: (org: LocationOrMaster) => void
    currentOrg: LocationOrMaster | null
    role: Role | null
    hasPermission: (permission: Permission) => boolean
}>({ availableOrgs: null, currentOrg: null, switchToOrg: () => {}, role: null, hasPermission: () => false })

export function OrgProvider({ children }: { children: ReactNode }) {
    const user = useAuth()

    const [availableOrgs, setAvailableOrgs] = useState<LocationOrMaster[] | null>(null)

    const cachedOrg = localStorage.getItem('selectedOrg')
    const [currentOrg, setCurrentOrg] = useState<LocationOrMaster | null>(
        cachedOrg ? (cachedOrg as LocationOrMaster) : null
    )

    const getRole = useCallback(
        (org: LocationOrMaster | null) => {
            if (user?.accountType === 'staff' && org) {
                return user.roles[org]
            }
            return null
        },
        [user]
    )

    const [role, setRole] = useState<Role | null>(getRole(currentOrg))

    useEffect(() => {
        if (user?.accountType === 'staff') {
            setAvailableOrgs(ObjectKeys(user.roles))
            setRole(getRole(currentOrg))
        } else if (user?.accountType === 'customer') {
            setRole(null)
            setCurrentOrg(null)
        }
    }, [user, currentOrg, getRole])

    return (
        <OrgContext.Provider
            value={{
                availableOrgs,
                currentOrg,
                switchToOrg: (org) => {
                    setCurrentOrg(org)
                    localStorage.setItem('selectedOrg', org)
                    setRole(getRole(org))
                },
                role,
                hasPermission: (permission) => {
                    return checkRoleForPermission(role, permission)
                },
            }}
        >
            {children}
        </OrgContext.Provider>
    )
}
