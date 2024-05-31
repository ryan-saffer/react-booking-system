import { Additions, AdditionsDisplayValuesMap, BaseBooking, Booking, CreationDisplayValuesMap } from 'fizz-kidz'

export const AdditionsFormMap: { [key: string]: Additions } = {
    'Chicken Nuggets - $35': Additions.chickenNuggets,
    'Fairy Bread - $30': Additions.fairyBread,
    'Gluten Free Fairy Bread - $40': Additions.glutenFreeFairyBread,
    'Fruit Platter - $45': Additions.fruitPlatter,
    'Frankfurts - $25': Additions.frankfurts,
    'Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $35': Additions.sandwichPlatter,
    'Vegetarian Spring Rolls - $30': Additions.vegetarianSpringRolls,
    'Vegetarian Quiches - $35': Additions.vegetarianQuiche,
    'Watermelon Platter - $25': Additions.watermelonPlatter,
    'Potato Gems - $30': Additions.potatoGems,
    'Wedges - $30': Additions.wedges,
    'Grazing Platter for Parents (Medium: 10-15 ppl) - $98': Additions.grazingPlatterMedium,
    'Grazing Platter for Parents (Large: 15-25 ppl) - $148': Additions.grazingPlatterLarge,
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

export function getPrefilledFormUrl(bookingId: string, booking: Booking) {
    let url = `https://ovrhkys4.paperform.co/?location=${
        booking.type === 'studio' ? booking.location : 'mobile'
    }&id=${bookingId}`
    const encodedParams: { [key: string]: string } = {
        parent_first_name: encodeURIComponent(booking.parentFirstName),
        parent_last_name: encodeURIComponent(booking.parentLastName),
        child_name: encodeURIComponent(booking.childName),
        child_age: encodeURIComponent(booking.childAge),
        food_package: booking.includesFood ? 'include_food_package' : 'dont_include_food_package',
    }

    Object.keys(encodedParams).forEach((key) => (url += `&${key}=${encodedParams[key]}`))

    return url
}
