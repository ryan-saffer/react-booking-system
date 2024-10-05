import { Location } from '../core/location'

/**
 * Subject Pronoun:
 * "Jenny will be your manager, she is great!"
 *
 * Object Pronoun:
 * "Jenny is your best point of contact, and you can reach her on..."
 *
 * Possessive Adjective:
 * "If you have any questions, feel free to contact her team."
 */
export function getManager(location: Location): {
    name: string
    email: string
    mobile: string
    subjectPronoun: string
    objectPronoun: string
    possesiveAdjective: string
} {
    switch (location) {
        case Location.BALWYN:
            return {
                name: 'Bronwyn',
                email: 'balwyn@fizzkidz.com.au',
                mobile: '0435 906 395',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case Location.ESSENDON:
            return {
                name: 'Lami',
                email: 'essendon@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case Location.CHELTENHAM:
            return {
                name: 'Ben',
                email: 'cheltenham@fizzkidz.com.au',
                mobile: '0490 450 282',
                subjectPronoun: 'he',
                objectPronoun: 'him',
                possesiveAdjective: 'his',
            }
        case Location.MALVERN:
            return {
                name: 'Lami',
                email: 'malvern@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}
