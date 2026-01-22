import { createContext } from 'react'

import type { StudioOrMaster, Role, Permission } from 'fizz-kidz'

export const OrgContext = createContext<{
    availableOrgs: StudioOrMaster[] | null
    switchToOrg: (org: StudioOrMaster) => void
    currentOrg: StudioOrMaster | null
    role: Role | null
    hasPermission: (permission: Permission) => boolean
}>({ availableOrgs: null, currentOrg: null, switchToOrg: () => {}, role: null, hasPermission: () => false })
