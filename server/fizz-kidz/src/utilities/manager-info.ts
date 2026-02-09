import type { Studio } from 'fizz-kidz/src/core/studio'

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
    location: Studio,
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
        case 'balwyn':
            return {
                name: 'Swetha',
                email: 'balwyn@fizzkidz.com.au',
                mobile: '0452 020 191',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case 'cheltenham':
            return {
                name: 'Olivia',
                email: 'cheltenham@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case 'essendon':
            return {
                name: 'Chloe',
                email: 'essendon@fizzkidz.com.au',
                mobile: '0431 379 953',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case 'kingsville':
            return {
                name: 'Kate',
                email: 'kingsville@fizzkidz.com.au',
                mobile: '0421 017 080',
                subjectPronoun: 'she',
                objectPronoun: 'her',
                possesiveAdjective: 'her',
            }
        case 'malvern':
            return {
                name: 'Lou',
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
