import { Location } from '../core/location'

export function getManager(location: Location) {
    switch (location) {
        case Location.BALWYN:
            return { name: 'Bronwyn', email: 'balwyn@fizzkidz.com.au', mobile: '0435 906 395' }
        case Location.ESSENDON:
            return { name: 'Bonnie', email: 'essendon@fizzkidz.com.au', mobile: '0431 379 953' }
        case Location.CHELTENHAM:
            return { name: 'Ben', email: 'cheltenham@fizzkidz.com.au', mobile: '0490 450 282' }
        case Location.MALVERN:
            return { name: 'Emily', email: 'malvern@fizzkidz.com.au', mobile: '0413 268 795' }
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}
