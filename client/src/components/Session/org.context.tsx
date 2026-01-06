import type { StudioOrMaster, Role, Permission } from 'fizz-kidz'
import { createContext } from 'react'

export const OrgContext = createContext<{
    availableOrgs: StudioOrMaster[] | null
    switchToOrg: (org: StudioOrMaster) => void
    currentOrg: StudioOrMaster | null
    role: Role | null
    hasPermission: (permission: Permission) => boolean
}>({ availableOrgs: null, currentOrg: null, switchToOrg: () => {}, role: null, hasPermission: () => false })
