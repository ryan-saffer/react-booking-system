import { Locations } from '../booking/Locations'

export function getLocationAddress(location: Exclude<Locations, 'mobile'>) {
    switch (location) {
        case Locations.BALWYN:
            return '184 Whitehorse Rd, Balwyn VIC 3103'
        case Locations.CHELTENHAM:
            return '273 Bay Rd, Cheltenham VIC 3192'
        case Locations.ESSENDON:
            return '75 Raleigh St, Essendon VIC 3040'
        case Locations.MALVERN:
            return '20 Glenferrie Rd, Malvern VIC 3144'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`cannot get address of unknown location: '${exhaustiveCheck}'`)
        }
    }
}
