import { Location } from '../partyBookings/Locations'

export function getManager(location: Location) {
    switch (location) {
        case Location.BALWYN:
            return { name: 'Bronwyn', email: 'balwyn@fizzkidz.com.au', mobile: '0435 906 395' }
        case Location.ESSENDON:
            return { name: 'Ali', email: 'essendon@fizzkidz.com.au', mobile: '0438 328 327' }
        case Location.CHELTENHAM:
            return { name: 'Bronwyn', email: 'cheltenham@fizzkidz.com.au', mobile: '0435 906 395' }
        case Location.MALVERN:
            return { name: 'Emily', email: 'malvern@fizzkidz.com.au', mobile: '0490 501 376' }
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}
