import { capitalise } from 'fizz-kidz'

import { LocationOrMaster } from '@components/Session/org-provider'

export function getOrgName(org: LocationOrMaster) {
    if (org === 'master') {
        return 'All Studios'
    } else {
        return `${capitalise(org)} Studio`
    }
}
