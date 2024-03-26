import { ObjectKeys } from '../utilities'
import { Location } from '..'

const LocationToClerkIdMapProd: Record<Location, string> = {
    [Location.BALWYN]: 'org_2dnprl6x1sCDtgYj2BYptOEVCJe',
    [Location.CHELTENHAM]: 'org_2dqIwdIapG5w7MNaE4dAtZxHVYp',
    [Location.ESSENDON]: 'org_2dqIyJFdAIqE51G5IFmqmvLH3q1',
    [Location.MALVERN]: 'org_2cQi16sraW7CQCee4iZDYHAYYcg',
}

const LocationToClerkIdMapDev: Record<Location, string> = {
    [Location.BALWYN]: 'org_2dnprl6x1sCDtgYj2BYptOEVCJe',
    [Location.CHELTENHAM]: 'org_2dqIwdIapG5w7MNaE4dAtZxHVYp',
    [Location.ESSENDON]: 'org_2dqIyJFdAIqE51G5IFmqmvLH3q1',
    [Location.MALVERN]: 'org_2cQi16sraW7CQCee4iZDYHAYYcg',
}

const MASTER_BUSINESS_PROD = 'org_2doVKxl5M5ckDzjmaUBNEUGaYds'
const MASTER_BUSINESS_DEV = 'org_2doVKxl5M5ckDzjmaUBNEUGaYds'

export function getLocationByClerkOrgId(id: string, env: 'prod' | 'dev') {
    if (env === 'dev' && id === MASTER_BUSINESS_DEV) return 'master'
    if (env === 'prod' && id === MASTER_BUSINESS_PROD) return 'master'

    const map = env === 'prod' ? LocationToClerkIdMapProd : LocationToClerkIdMapDev
    const location = ObjectKeys(map).find((it) => map[it] === id)
    if (!location) {
        throw new Error(`Unable to find clerk org with id: ${id}`)
    }
    return location
}
