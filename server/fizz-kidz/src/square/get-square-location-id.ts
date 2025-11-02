import { type StudioOrTest } from 'fizz-kidz/src/core/studio'
import { assertNever } from '../utilities/assert-never'

export function getSquareLocationId(studio: StudioOrTest) {
    switch (studio) {
        case 'test':
            return 'L834ATV1QTRQW'
        case 'balwyn':
            return 'PZ2H7FT3BW5F4'
        case 'cheltenham':
            return 'LEMPV8BSN8T40'
        case 'malvern':
            return 'NSS38M5PEET6N'
        case 'kingsville':
            return 'L380VTEX8KAVT'
        case 'essendon':
            return '6P5FX9MG3SBJ6'
        default: {
            assertNever(studio)
            throw new Error(`Unhandled location in getSquareLocationId(): '${studio}'`)
        }
    }
}
