import { Locations } from '../partyBookings/Locations'

export function getManager(location: Locations) {
    switch (location) {
        case Locations.BALWYN:
            return { name: 'Bonnie', email: 'balwyn@fizzkidz.com.au', mobile: '0413 268 795' }
        case Locations.ESSENDON:
            return { name: 'Ali', email: 'essendon@fizzkidz.com.au', mobile: '0438 328 327' }
        case Locations.MOBILE:
            return { name: 'Bonnie', email: 'bonnie@fizzkidz.com.au', mobile: '0413 268 795' }
        case Locations.CHELTENHAM:
            return { name: 'Maxie', email: 'cheltenham@fizzkidz.com.au', mobile: '0431 772 716' }
        case Locations.MALVERN:
            return { name: 'Bonnie', email: 'malvern@fizzkidz.com.au', mobile: '0413 268 795' }
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}
