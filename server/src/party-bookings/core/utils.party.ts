import { DateTime } from 'luxon'

import type { Addition, BaseBooking } from 'fizz-kidz'
import { ADDITIONS, CREATIONS, getCloudFunctionsDomain } from 'fizz-kidz'

import { env } from '@/init'

export function getBookingCreations(booking: BaseBooking) {
    const result: string[] = []
    if (booking.creation1) {
        result.push(CREATIONS[booking.creation1])
    }
    if (booking.creation2) {
        result.push(CREATIONS[booking.creation2])
    }
    if (booking.creation3) {
        result.push(CREATIONS[booking.creation3])
    }
    return result
}

export function getBookingAdditions(booking: BaseBooking) {
    const output: string[] = []
    for (const key of Object.keys(booking)) {
        if (isAddition(key)) {
            if (booking[key] === true) {
                output.push(ADDITIONS[key].displayValue)
            }
        }
    }
    return output
}

export function isAddition(key: string): key is Addition {
    return Object.keys(key).includes(key)
}

export function getPartyFormUrl(bookingId: string) {
    return `${getCloudFunctionsDomain(
        env,
        process.env.FUNCTIONS_EMULATOR === 'true'
    )}/api/api/webhooks/party-form?id=${bookingId}`
}

export function getCakeFormUrl(bookingId: string, useEmulator?: boolean) {
    return `${getCloudFunctionsDomain(
        env,
        useEmulator ?? process.env.FUNCTIONS_EMULATOR === 'true'
    )}/api/api/webhooks/cake-form?id=${bookingId}`
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
