import { useContext } from 'react'

import { OrgContext } from './org.context'

export function useOrg() {
    const orgContext = useContext(OrgContext)
    return orgContext
}
