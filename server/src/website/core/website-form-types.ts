import { Location } from 'fizz-kidz'

export type Form = {
    party: {
        name: string
        email: string
        contactNumber: string
        location: ContactFormLocationOption
        suburb?: string
        preferredDateAndTime: string
        enquiry: string
        reference: ReferenceOption
        referenceOther?: string
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
        reference: ReferenceOption
        referenceOther?: string
    }
    event: {
        name: string
        email: string
        contactNumber?: string
        company: string
        preferredDateAndTime: string
        enquiry: string
    }
    incursion: {
        name: string
        school: string
        email: string
        contactNumber: string
        preferredDateAndTime: string
        module: IncursionFormModuleOption
        enquiry: string
    }
    careers: {
        name: string
        email: string
        contactNumber: string
        role: CareersFormRoleOption
        location: Location
        wwcc: string
        driversLicense: string
        application: string
        reference: string
        resume: { name: string; url: string }
    }
    mailingList: {
        name: string
        email: string
    }
    holidayProgramDiscount: {
        name: string
        email: string
    }
    franchising: {
        firstName: string
        lastName: string
        email: string
        contactNumber: string
        suburb: string
        state: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'TAS' | 'VIC' | 'WA'
        experience: string
        interest: FranchisingInterestOption
        enquiry: string
        reference: string
    }
}

export type ContactFormServiceOption =
    | 'party'
    | 'holiday-program'
    | 'after-school-program'
    | 'incursion'
    | 'activation'
    | 'other'

export type ReferenceOption = 'google' | 'instagram' | 'word-of-mouth' | 'attended-fizz' | 'other'

export type ContactFormLocationOption = `${Location}` | 'at-home' | 'other'

type IncursionFormModuleOption =
    | 'chemicalScience'
    | 'pushAndPull'
    | 'lightAndSound'
    | 'earthWeatherSustainability'
    | 'notSure'

type CareersFormRoleOption = 'manager' | 'supervisor' | 'facilitator' | 'other'

type FranchisingInterestOption = 'browsing' | '3' | '6' | '12' | '12+'

export const ContactFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    'at-home': undefined,
    other: undefined,
    balwyn: Location.BALWYN,
    cheltenham: Location.CHELTENHAM,
    essendon: Location.ESSENDON,
    kingsville: Location.KINGSVILLE,
    malvern: Location.MALVERN,
}

export const PartyFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    balwyn: Location.BALWYN,
    cheltenham: Location.CHELTENHAM,
    essendon: Location.ESSENDON,
    kingsville: Location.KINGSVILLE,
    malvern: Location.MALVERN,
    'at-home': undefined,
    other: undefined,
}

export const LocationDisplayValueMap: Record<ContactFormLocationOption, string> = {
    other: 'Other',
    balwyn: 'Balwyn Studio',
    cheltenham: 'Cheltenham Studio',
    essendon: 'Essendon Studio',
    kingsville: 'Kingsville Studio',
    malvern: 'Malvern Studio',
    'at-home': 'At Home',
}

export const ReferenceDisplayValueMap: Record<ReferenceOption, string> = {
    google: 'Google Search',
    instagram: 'Instagram',
    'word-of-mouth': 'Word of mouth',
    'attended-fizz': 'Attended a Fizz Kidz experience',
    other: 'Other',
}

export const ServiceDisplayValueMap: Record<ContactFormServiceOption, string> = {
    party: 'Birthday Party',
    'holiday-program': 'Holiday Program',
    'after-school-program': 'After School Program',
    incursion: 'School Incursions',
    activation: 'Activation & Event',
    other: 'Other',
}

export const ModuleDisplayValueMap: Record<IncursionFormModuleOption, string> = {
    chemicalScience: 'Chemical Science',
    pushAndPull: 'Push and Pull',
    lightAndSound: 'Light and Sound',
    earthWeatherSustainability: 'Earth, Weather and Sustainability',
    notSure: 'A combination of the above / not sure',
}

export const RoleDisplayValueMap: Record<CareersFormRoleOption, string> = {
    other: 'Other',
    manager: 'Studio Manager',
    supervisor: 'Studio Supervisor',
    facilitator: 'Studio Facilitator',
}

export const FranchisingInterestDisplayValueMap: Record<FranchisingInterestOption, string> = {
    browsing: 'Just browsing',
    3: 'Get started in 3 months',
    6: 'Get started in 3-6 months',
    12: 'Get started in 6-12 months',
    '12+': 'Get started in 12+ months',
}
