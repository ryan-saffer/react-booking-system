import { getLocationByClerkOrgId } from 'fizz-kidz'

import { useOrganization } from '@clerk/clerk-react'

export function useStudio() {
    const { organization } = useOrganization()
    if (organization.id) {
        return getLocationByClerkOrgId(organization.id, import.meta.env.VITE_ENV)
    }
    throw new Error(`'useStudio() can only be used once clerk is loaded`)
}
