import { Additions, AdditionsDisplayValuesMap, BaseBooking, CreationDisplayValuesMap, Locations } from 'fizz-kidz'

export const AdditionsFormMap: { [key: string]: Additions } = {
    'Chicken Nuggets - $35': Additions.chickenNuggets,
    'Fairy Bread - $30': Additions.fairyBread,
    'Fruit Platter - $45': Additions.fruitPlatter,
    'Frankfurts - $25': Additions.frankfurts,
    'Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $35': Additions.sandwichPlatter,
    'Vegetarian Quiches - $35': Additions.vegetarianQuiche,
    'Watermelon Platter - $25': Additions.watermelonPlatter,
    'Wedges - $30': Additions.wedges,
    'Grazing Platter for Parents (Medium: 10-15 ppl) - $98': Additions.grazingPlatterMedium,
    'Grazing Platter for Parents (Large: 15-25 ppl) - $148': Additions.grazingPlatterLarge,
}

export function getManagerEmail(location: Locations) {
    switch (location) {
        case Locations.BALWYN:
        case Locations.ESSENDON:
        case Locations.MOBILE:
            return 'bonnie@fizzkidz.com.au'
        case Locations.CHELTENHAM:
            return 'cheltenham@fizzkidz.com.au'
        case Locations.MALVERN:
            return 'malvern@fizzkidz.com.au'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unknown location: ${exhaustiveCheck}`)
        }
    }
}

export function getBookingCreations(booking: BaseBooking) {
    const result: string[] = []
    if (booking.creation1) {
        result.push(CreationDisplayValuesMap[booking.creation1])
    }
    if (booking.creation2) {
        result.push(CreationDisplayValuesMap[booking.creation2])
    }
    if (booking.creation3) {
        result.push(CreationDisplayValuesMap[booking.creation3])
    }
    return result
}

export function getBookingAdditions(booking: BaseBooking) {
    const output: string[] = []
    // iterate each property of the booking
    for (const key of Object.keys(booking)) {
        // and check if its an addition
        if (Object.keys(Additions).includes(key)) {
            // and include it if its true
            if ((booking as any)[key]) {
                output.push((AdditionsDisplayValuesMap as any)[key])
            }
        }
    }
    return output
}
