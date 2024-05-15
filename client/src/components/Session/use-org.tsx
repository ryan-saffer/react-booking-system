import { useContext } from 'react'

import { OrgContext } from './org-provider'

export function useOrg() {
    const orgContext = useContext(OrgContext)
    return orgContext
}
