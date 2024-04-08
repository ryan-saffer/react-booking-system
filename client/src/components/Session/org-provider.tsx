import { Location, ObjectKeys } from 'fizz-kidz'
import { ReactNode, createContext, useEffect, useState } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'

export type LocationOrMaster = Location | 'master'

export const OrgContext = createContext<{
    availableOrgs: LocationOrMaster[] | null
    switchToOrg: (org: LocationOrMaster) => void
    selectedOrg: LocationOrMaster | null
    role: string | null
}>({ availableOrgs: null, selectedOrg: null, switchToOrg: () => {}, role: null })

export function OrgProvider({ children }: { children: ReactNode }) {
    const user = useAuth()

    const [availableOrgs, setAvailableOrgs] = useState<LocationOrMaster[]>([])

    const cachedOrg = localStorage.getItem('selectedOrg')
    const [selectedOrg, setSelectedOrg] = useState<LocationOrMaster | null>(
        cachedOrg ? (cachedOrg as LocationOrMaster) : null
    )

    const getRole = (org: LocationOrMaster | null) => {
        if (user?.accountType === 'staff' && org) {
            return user.roles[org]
        }
        return null
    }

    const [role, setRole] = useState<string | null>(getRole(selectedOrg))

    useEffect(() => {
        if (user?.accountType === 'staff') {
            setAvailableOrgs(ObjectKeys(user.roles))
        }
    }, [user])

    return (
        <OrgContext.Provider
            value={{
                availableOrgs,
                selectedOrg,
                switchToOrg: (org) => {
                    setSelectedOrg(org)
                    localStorage.setItem('selectedOrg', org)
                    setRole(getRole(org))
                },
                role,
            }}
        >
            {children}
        </OrgContext.Provider>
    )
}
