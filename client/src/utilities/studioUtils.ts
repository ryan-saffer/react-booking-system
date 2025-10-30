import type { StudioOrMaster } from 'fizz-kidz'
import { capitalise } from 'fizz-kidz'

export function getOrgName(org: StudioOrMaster) {
    if (org === 'master') {
        return 'All Studios'
    } else {
        return `${capitalise(org)} Studio`
    }
}
