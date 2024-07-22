import { Location } from 'fizz-kidz'

export type Form = {
    'party-booking': {
        'your-name': string
        'your-email': string
        phone: string
        location: PartyFormLocationDropdownOption
        datetime: string
        enquiry: string
    }
    contact: {
        name: string
        email: string
        contactNumber: string
        service: ContactFormServiceOption
        location?: ContactFormLocationOption
        suburb?: string
        preferredDateAndTime?: string
        enquiry: string
    }
    event: {
        name: string
        email: string
        contactNumber?: string
        company: string
        preferredDateAndTime: string
        enquiry: string
    }
    incursion: { 'your-name': string; school: string; 'your-email': string; phone: string }
}

type ContactFormServiceOption =
    | 'party'
    | 'holiday-program'
    | 'after-school-program'
    | 'incursion'
    | 'activation'
    | 'other'

type ContactFormLocationOption = 'balwyn' | 'cheltenham' | 'essendon' | 'malvern' | 'at-home' | 'other'

export const ContactFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    'at-home': undefined,
    other: undefined,
    balwyn: Location.BALWYN,
    cheltenham: Location.CHELTENHAM,
    essendon: Location.ESSENDON,
    malvern: Location.MALVERN,
}

type PartyFormLocationDropdownOption =
    | 'Balwyn Studio'
    | 'Cheltenham Studio'
    | 'Essendon Studio'
    | 'Malvern Studio'
    | 'Mobile (at home)'
    | 'Other'

export const PartyFormLocationMap: Record<PartyFormLocationDropdownOption, Location | undefined> = {
    'Balwyn Studio': Location.BALWYN,
    'Cheltenham Studio': Location.CHELTENHAM,
    'Essendon Studio': Location.ESSENDON,
    'Malvern Studio': Location.MALVERN,
    'Mobile (at home)': undefined,
    Other: undefined,
}

export const LocationDisplayValueMap: Record<ContactFormLocationOption, string> = {
    other: 'Other',
    balwyn: 'Balwyn Studio',
    cheltenham: 'Cheltenham Studio',
    essendon: 'Essendon Studio',
    malvern: 'Malvern Studio',
    'at-home': 'At Home',
}

export const ServiceDisplayValueMap: Record<ContactFormServiceOption, string> = {
    party: 'Birthday Party',
    'holiday-program': 'Holiday Program',
    'after-school-program': 'After School Program',
    incursion: 'School Incursions',
    activation: 'Activation & Event',
    other: 'Other',
}
