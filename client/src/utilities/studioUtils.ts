import type { LocationOrMaster } from 'fizz-kidz'
import { capitalise } from 'fizz-kidz'

export function getOrgName(org: LocationOrMaster) {
    if (org === 'master') {
        return 'All Studios'
    } else {
        return `${capitalise(org)} Studio`
    }
}
