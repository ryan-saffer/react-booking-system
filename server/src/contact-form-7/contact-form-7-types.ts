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
        'your-name': string
        'your-email': string
        phone: string
        service: ContactFormServiceOption
        location?: ContactFormLocationOption
    }
    event: {
        'your-name': string
        'your-email': string
        company: string
    }
    incursion: { 'your-name': string; school: string; 'your-email': string; phone: string }
}

type ContactFormServiceOption =
    | 'Birthday Party'
    | 'Holiday Program'
    | 'School Science Program'
    | 'School Incursion'
    | 'Activation and Events'
    | 'Mini Science'
    | 'Other'

type ContactFormLocationOption = 'Balwyn' | 'Cheltenham' | 'Essendon' | 'Malvern' | 'Mobile (at home)' | 'Other'

export const ContactFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    'Mobile (at home)': undefined,
    Other: undefined,
    Balwyn: Location.BALWYN,
    Cheltenham: Location.CHELTENHAM,
    Essendon: Location.ESSENDON,
    Malvern: Location.MALVERN,
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
