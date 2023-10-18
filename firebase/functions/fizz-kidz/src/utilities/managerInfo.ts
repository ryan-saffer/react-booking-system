import { Location } from '../partyBookings/Locations'

export function getManager(location: Location) {
    switch (location) {
        case Location.BALWYN:
            return { name: 'Bonnie', email: 'balwyn@fizzkidz.com.au', mobile: '0413 268 795' }
        case Location.ESSENDON:
            return { name: 'Ali', email: 'essendon@fizzkidz.com.au', mobile: '0438 328 327' }
        case Location.MOBILE:
            return { name: 'Bonnie', email: 'bonnie@fizzkidz.com.au', mobile: '0413 268 795' }
        case Location.CHELTENHAM:
            return { name: 'Bronwyn', email: 'cheltenham@fizzkidz.com.au', mobile: '0431 379 953' }
        case Location.MALVERN:
            return { name: 'Bonnie', email: 'malvern@fizzkidz.com.au', mobile: '0413 268 795' }
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}
