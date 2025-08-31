import { Location } from '../core/location'

/**
 * Subject Pronoun:
 * "Jenny will be your manager, he is great!"
 *
 * Object Pronoun:
 * "Jenny is your best point of contact, and you can reach him on..."
 *
 * Possessive Adjective:
 * "If you have any questions, feel free to contact his team."
 */
export function getManager(
    location: Location,
    env: 'dev' | 'prod' = 'prod'
): {
    name: string
    email: string
    mobile: string
    subjectPronoun: string
    objectPronoun: string
    possesiveAdjective: string
} {
    if (env === 'dev') {
        return {
            name: 'Ryan',
            email: 'ryansaffer@gmail.com',
            mobile: '0413892120',
            subjectPronoun: 'he',
            objectPronoun: 'him',
            possesiveAdjective: 'his',
        }
    }
    switch (location) {
        case Location.BALWYN:
            return {
                name: 'Lami',
                email: 'balwyn@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case Location.CHELTENHAM:
            return {
                name: 'Lami',
                email: 'cheltenham@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case Location.ESSENDON:
            return {
                name: 'Kym',
                email: 'essendon@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case Location.KINGSVILLE:
            return {
                name: 'Kym',
                email: 'kingsville@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
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
