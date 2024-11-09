import {
    Additions,
    AdditionsDisplayValuesMap,
    BaseBooking,
    Booking,
    CreationDisplayValuesMap,
    Creations,
} from 'fizz-kidz'
import { DateTime } from 'luxon'

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

export const CreationsFormMap: { [key: string]: Creations } = {
    'Glitter Slime': Creations.glitterSlime,
    'Glitter Face Paint': Creations.glitterFacePaint,
    'Rainbow Bath Crystals': Creations.rainbowBathCrystals,
    'Unicorn Soap': Creations.unicornSoap,
    'Fizzy Bath Bombs': Creations.bathBombs,
    'Rainbow Bath Bombs': Creations.rainbowBathBombs,
    'Sparkling Lip-Balm': Creations.lipBalm,
    'Fluffy Slime': Creations.fluffySlime,
    'Sugar Lip Scrub': Creations.sugarScrubLipBalm,
    'Bubbling Volcanoes': Creations.volcanoes,
    'Wobbly Galaxy Soap': Creations.wobblyGalaxySoap,
    'Instant Snow Slime': Creations.instantSnowSlime,
    'Dinosaur Fossils': Creations.dinosaurFossils,
    'Monster Slime': Creations.monsterSlime,
    'Wobbly Star Soap': Creations.wobblyStarSoap,
    'Fairy Glitter Slime': Creations.glitterSlime,
    'Unicorn Slime': Creations.unicornSlime,
    'Rainbow Slime': Creations.rainbowSlime,
    'Galaxy Slime': Creations.galaxySlime,
    'Frozen Sparkle Slime': Creations.frozenSparkleSlime,
    'Animal Soap': Creations.animalSoap,
    'Animals in Soap': Creations.animalsInSoap,
    'Sand Slime': Creations.sandSlime,
    'Animals in Bath Bombs': Creations.animalsInBathBombs,
    'Bugs in Bath Bombs': Creations.bugsInBathBombs,
    'Unicorn Glitter Shimmer': Creations.unicornGlitterShimmer,
    'Unicorn Bath Crystals': Creations.unicornBathCrystals,
    'Butterfly Soap': Creations.butterflySoap,
    'Unicorn Bath Bombs': Creations.unicornBathBombs,
    'Tie Dye Soap': Creations.tieDyeSoap,
    'Tie Dye Pillow': Creations.tieDyePillow,
    'Marble Crystals': Creations.marbleCrystals,
    'Tie Dye Tote Bags': Creations.tieDyeToteBags,
    'Tie Dye Socks': Creations.tieDyeSocks,
    'Tie Dye Scrunchies': Creations.tieDyeScrunchie,
    "'Speak Now' Purple Bath Bombs": Creations.speakNowPurpleBathbombs,
    "'Lover' Tie Dye Scrunchies": Creations.loverTieDyeScrunchies,
    'Folklore Butterfly Soap': Creations.folkloreButterflySoap,
    'Friendship Bracelets': Creations.friendshipBracelets,
    "'Lover' Rainbow Bath Bombs": Creations.loverRainbowBathBombs,
    'Fearless Gold Slime': Creations.fearlessGoldSlime,
    'Midnights Slime': Creations.midnightsSlime,
    'Red 1989 Lip Balm': Creations.red1989LipBalm,
    "'Lover' Glitter Face Paint": Creations.loverGlitterFacePaint,
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
    let url = `https://tdazzggr.paperform.co/?location=${
        booking.type === 'studio' ? booking.location : 'mobile'
    }&id=${bookingId}`
    const encodedParams: { [key: string]: string } = {
        parent_first_name: encodeURIComponent(booking.parentFirstName),
        parent_last_name: encodeURIComponent(booking.parentLastName),
        child_name: encodeURIComponent(booking.childName),
        child_age: encodeURIComponent(booking.childAge),
        food_package: booking.includesFood
            ? encodeURIComponent('Include the food package')
            : encodeURIComponent('I will self-cater the party'),
    }

    Object.keys(encodedParams).forEach((key) => (url += `&${key}=${encodedParams[key]}`))

    return url
}

const DAYS_OF_THE_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
type DayOfTheWeek = (typeof DAYS_OF_THE_WEEK)[number]

/**
 * Given a day of the week, it will return the next upcoming day as a Date.
 *
 * @example
 * // If used on a Monday
 * getUpcoming('Sunday') // in 6 days
 * getUpcoming('Monday') // in 7 days
 * getUpcoming('Tuesday') // in 1 day
 *
 * @param day - the upcoming day you want to get
 * @returns the date of the upcoming day, at midnight.
 */
export function getUpcoming(day: DayOfTheWeek) {
    const today = DateTime.fromJSDate(new Date(), { zone: 'Australia/Melbourne' }).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    })
    const currentDayIndex = today.weekday % 7 // Luxon weekday goes from 1 (Monday) to 7 (Sunday)
    const targetDayIndex = DAYS_OF_THE_WEEK.indexOf(day)

    let daysUntilNext = targetDayIndex - currentDayIndex
    if (daysUntilNext <= 0) {
        daysUntilNext += 7
    }

    const nextDate = today.plus({ days: daysUntilNext })
    return nextDate.toJSDate()
}
