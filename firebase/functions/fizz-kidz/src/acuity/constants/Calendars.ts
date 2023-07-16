import { SchoolBranch } from '../../hubspot'
import { Locations } from '../../partyBookings/Locations'
import { ValuesAsKeys } from '../../utilities'

export const StoreCalendars: Omit<ValuesAsKeys<typeof Locations, number>, 'mobile'> = {
    balwyn: 3163510,
    cheltenham: 7382613,
    essendon: 3723560,
    malvern: 3163508,
}

export const SchoolCalendars: { [Key in SchoolBranch]: number } = {
    'Blackburn Primary': 3081644,
    'Chalcot Lodge': 3593004,
    'Malvern Primary': 3232918,
    'Elwood Primary': 3716063,
    'Elsternwick Primary': 3716165,
    'St Michaels Grammar': 3716097,
    'Heany Park Primary': 3716184,
    'McKinnon Primary': 3716192,
    Hughesdale: 4828350,
    'Abbotsford Primary': 6301692,
    'Auburn Primary': 6663914,
    'Burwood East Primary': 5721818,
    'Flemington Primary': 5721911,
    'Hampton Primary': 6947387,
    'Huntingdale Primary': 5293344,
    'Karoo Primary': 5293356,
    'Malvern Valley Primary': 6663917,
    'Oakleigh Grammar': 6308939,
    'Old Orchard Primary': 6311939,
    'Ripponlea Primary': 6947379,
    'St Kilda Primary': 7217388,
}

export const TestCalendarId = 3657946
