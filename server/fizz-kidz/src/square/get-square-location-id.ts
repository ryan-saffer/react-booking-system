import { Location, type LocationOrTest } from '../core/location'
import { assertNever } from '../utilities/assert-never'

export function getSquareLocationId(studio: LocationOrTest) {
    switch (studio) {
        case 'test':
            return 'L834ATV1QTRQW'
        case Location.BALWYN:
            return 'PZ2H7FT3BW5F4'
        case Location.CHELTENHAM:
            return 'LEMPV8BSN8T40'
        case Location.MALVERN:
            return 'NSS38M5PEET6N'
        case Location.KINGSVILLE:
            return 'L380VTEX8KAVT'
        case Location.ESSENDON:
            return '6P5FX9MG3SBJ6'
        default: {
            assertNever(studio)
            throw new Error(`Unhandled location in getSquareLocationId(): '${studio}'`)
        }
    }
}
