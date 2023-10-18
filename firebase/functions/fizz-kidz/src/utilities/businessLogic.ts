import { Location } from '../partyBookings/Locations'
import { Booking } from '../partyBookings/booking'

export function getLocationAddress(location: Exclude<Location, 'mobile'>) {
    switch (location) {
        case Location.BALWYN:
            return '184 Whitehorse Rd, Balwyn VIC 3103'
        case Location.CHELTENHAM:
            return '273 Bay Rd, Cheltenham VIC 3192'
        case Location.ESSENDON:
            return '75 Raleigh St, Essendon VIC 3040'
        case Location.MALVERN:
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

export function getApplicationDomain(environment: 'prod' | 'dev') {
    return environment === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://dev.fizzkidz.com.au'
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

export function getNumberOfKidsAllowed(location: Location) {
    if (location === Location.CHELTENHAM) {
        return ['4 and 5 years old - max 20 kids', '6 years plus - max 26 kids']
    } else {
        return ['4 and 5 years old - max 24 kids', '6 years plus - max 30 kids']
    }
}

export function getPictureOfStudioUrl(location: Location) {
    switch (location) {
        case Location.BALWYN:
            return 'https://drive.google.com/file/d/14mqrG74qkbE43FGqexGS1_zfb11mOONy/view?usp=sharing'
        case Location.CHELTENHAM:
            return 'https://drive.google.com/file/d/1PLiZZEqr2yGBd-ipLixzfLkh5FkrO1oG/view?usp=sharing'
        case Location.ESSENDON:
            return 'https://drive.google.com/file/d/1nOwuD1K43bveRc_UGQLeiw7uvXX6Fw2g/view?usp=sharing'
        case Location.MALVERN:
            return 'https://drive.google.com/file/d/1rqxePd3Xj846UO_czIpq_8JFw6jPeWZh/view?usp=sharing'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unhandled location: '${exhaustiveCheck}`)
        }
    }
}

export function getReviewUrl(location: Location) {
    switch (location) {
        case Location.BALWYN:
            return 'https://search.google.com/local/writereview?placeid=ChIJRYl9pexB1moR5msbM8SdKVU'
        case Location.CHELTENHAM:
            return 'https://search.google.com/local/writereview?placeid=ChIJxb0bw3lv1moRwrl1Q_P-cHo'
        case Location.ESSENDON:
            return 'https://search.google.com/local/writereview?placeid=ChIJq_RqJMNd1moRksRMHNY2ExQ'
        case Location.MALVERN:
            return 'https://search.google.com/local/writereview?placeid=ChIJ92NJJx5q1moRdDSJo_X3BRo'
        default: {
            const exhaustiveCheck: never = location
            throw new Error(`Unhandled location in getReviewUrl: '${exhaustiveCheck}'`)
        }
    }
}
