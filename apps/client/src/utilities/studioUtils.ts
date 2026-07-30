import type { StudioOrMaster } from '@fizz-kidz/core'
import { capitalise } from '@fizz-kidz/core'

export function getOrgName(org: StudioOrMaster) {
    if (org === 'master') {
        return 'Corporate Studios'
    } else {
        return `${capitalise(org)} Studio`
    }
}
