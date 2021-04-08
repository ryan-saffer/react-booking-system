import { Locations } from './booking/locations'
import { CakeFlavours } from './booking/cakeFlavours'
import { Additions } from './booking/additions'
import { Creations } from './booking/creations'
import { CreationDisplayValues } from './booking/creationDisplayValues'
import * as Domain from './booking/domain'
import * as Network from './booking/network'

export const Booking = {
    Domain,
    Network,
    Locations,
    CakeFlavours,
    Additions,
    Creations,
    CreationDisplayValues,
}
export * as Acuity from './acuity'
export * as AppsScript from './appsscript'