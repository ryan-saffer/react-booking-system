import { Locations } from '../..'
import { ValuesAsKeys } from '../../utilities'

export const StoreCalendars: Omit<ValuesAsKeys<typeof Locations, number>, 'mobile'> = {
    balwyn: 3163510,
    cheltenham: 7382613,
    essendon: 3723560,
    malvern: 3163508,
}

export const TestCalendarId = 3657946
