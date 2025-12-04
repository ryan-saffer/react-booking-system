import type { Studio } from 'fizz-kidz/src/core/studio'
import { type StudioOrTest } from 'fizz-kidz/src/core/studio'
import type { Booking } from '../partyBookings/booking'
import { capitalise } from './stringUtilities'

export function getStudioAddress(location: Studio) {
    switch (location) {
        case 'balwyn':
            return '184 Whitehorse Rd, Balwyn VIC 3103'
        case 'cheltenham':
            return '273 Bay Rd, Cheltenham VIC 3192'
        case 'essendon':
            return '75 Raleigh St, Essendon VIC 3040'
        case 'kingsville':
            return '238 Somerville Rd, Kingsville, VIC 3012'
        case 'malvern':
            return '20 Glenferrie Rd, Malvern VIC 3144'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`cannot get address of unknown location: '${exhaustiveCheck}'`)
        }
    }
}

export function getPartyEndDate(start: Date, partyLength: Booking['partyLength']) {
    // determine when party ends
    let lengthHours = 0
    let lengthMinutes = 0
    switch (partyLength) {
        case '1':
            lengthHours = 1
            break
        case '1.5':
            lengthHours = 1
            lengthMinutes = 30
            break
        case '2':
            lengthHours = 2
            break
        default: {
            const exhaustiveCheck: never = partyLength
            throw new Error(`invalid party length of '${exhaustiveCheck}'`)
        }
    }

    const endDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        start.getHours() + lengthHours,
        start.getMinutes() + lengthMinutes
    )

    return endDate
}

export function getApplicationDomain(environment: 'prod' | 'dev', useEmulator: boolean) {
    if (useEmulator) {
        return 'http://localhost:3000'
    }
    return environment === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://dev.fizzkidz.com.au'
}

export function getCloudFunctionsDomain(env: 'prod' | 'dev', useEmulator: boolean) {
    if (useEmulator) {
        return env === 'prod'
            ? 'http://127.0.0.1:5001/bookings-prod/australia-southeast1/api/api'
            : 'http://127.0.0.1:5001/booking-system-6435d/australia-southeast1/api/api'
    }

    return `${getApplicationDomain(env, false)}/api`
    // return env === 'prod'
    //     ? 'https://australia-southeast1-bookings-prod.cloudfunctions.net/api/api'
    //     : 'https://australia-southeast1-booking-system-6435d.cloudfunctions.net/api/api'
}

export function getPartyCreationCount(type: Booking['type'], partyLength: '1' | '1.5' | '2') {
    if (type === 'mobile') {
        switch (partyLength) {
            case '1':
                return 'two'
            case '1.5':
                return 'three'
            default:
                throw new Error('invalid combination of party location and length')
        }
    } else {
        switch (partyLength) {
            case '1.5':
                return 'two'
            case '2':
                return 'three'
            default:
                throw new Error('invalid combination of party location and length')
        }
    }
}

export function getNumberOfKidsAllowed(location: Studio) {
    if (location === 'cheltenham') {
        return ['4 and 5 years old - max 20 kids', '6 years plus - max 26 kids']
    } else {
        return ['4 and 5 years old - max 24 kids', '6 years plus - max 30 kids']
    }
}

export function getPictureOfStudioUrl(location: Studio) {
    switch (location) {
        case 'balwyn':
            return 'https://drive.google.com/file/d/14mqrG74qkbE43FGqexGS1_zfb11mOONy/view?usp=sharing'
        case 'cheltenham':
            return 'https://drive.google.com/file/d/1PLiZZEqr2yGBd-ipLixzfLkh5FkrO1oG/view?usp=sharing'
        case 'essendon':
            return 'https://drive.google.com/file/d/1nOwuD1K43bveRc_UGQLeiw7uvXX6Fw2g/view?usp=sharing'
        case 'kingsville':
            return 'https://drive.google.com/file/d/1aP9aFANjEhiaal8l7rjouWZhdUPfv5ts/view?usp=sharing'
        case 'malvern':
            return 'https://drive.google.com/file/d/1rqxePd3Xj846UO_czIpq_8JFw6jPeWZh/view?usp=sharing'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unhandled location: '${exhaustiveCheck}`)
        }
    }
}

export function getReviewUrl(location: Studio) {
    switch (location) {
        case 'balwyn':
            return 'https://search.google.com/local/writereview?placeid=ChIJRYl9pexB1moR5msbM8SdKVU'
        case 'cheltenham':
            return 'https://search.google.com/local/writereview?placeid=ChIJxb0bw3lv1moRwrl1Q_P-cHo'
        case 'essendon':
            return 'https://search.google.com/local/writereview?placeid=ChIJq_RqJMNd1moRksRMHNY2ExQ'
        case 'kingsville':
            return 'https://g.page/r/CRQItX8-YnBFEBM/review'
        case 'malvern':
            return 'https://search.google.com/local/writereview?placeid=ChIJ92NJJx5q1moRdDSJo_X3BRo'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unhandled location in getReviewUrl: '${exhaustiveCheck}'`)
        }
    }
}

export function studioNameAndAddress(studio: StudioOrTest) {
    if (studio === 'test') {
        return 'TEST'
    }

    return `Fizz Kidz ${capitalise(studio)}\nStudio<br>${getStudioAddress(studio)}`
}
