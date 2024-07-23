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
        wwcc: string
        driversLicense: string
        application: string
        reference: string
        resume: { name: string; url: string }
    }
}

type ContactFormServiceOption =
    | 'party'
    | 'holiday-program'
    | 'after-school-program'
    | 'incursion'
    | 'activation'
    | 'other'

type ContactFormLocationOption = 'balwyn' | 'cheltenham' | 'essendon' | 'malvern' | 'at-home' | 'other'

type IncursionFormModuleOption =
    | 'chemicalScience'
    | 'pushAndPull'
    | 'lightAndSound'
    | 'earthWeatherSustainability'
    | 'notSure'

type CareersFormRoleOption =
    | 'cheltenham-manager'
    | 'balwyn-facilitator'
    | 'cheltenahm-facilitator'
    | 'essendon-facilitator'
    | 'malvern-facilitator'
    | 'other'

export const ContactFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    'at-home': undefined,
    other: undefined,
    balwyn: Location.BALWYN,
    cheltenham: Location.CHELTENHAM,
    essendon: Location.ESSENDON,
    malvern: Location.MALVERN,
}

export const PartyFormLocationMap: Record<ContactFormLocationOption, Location | undefined> = {
    balwyn: Location.BALWYN,
    cheltenham: Location.CHELTENHAM,
    essendon: Location.ESSENDON,
    malvern: Location.MALVERN,
    'at-home': undefined,
    other: undefined,
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

export const ModuleDisplayValueMap: Record<IncursionFormModuleOption, string> = {
    chemicalScience: 'Chemical Science',
    pushAndPull: 'Push and Pull',
    lightAndSound: 'Light and Sound',
    earthWeatherSustainability: 'Earth, Weather and Sustainability',
    notSure: 'A combination of the above / not sure',
}

export const RoleDisplayValueMap: Record<CareersFormRoleOption, string> = {
    other: 'Other',
    'cheltenham-manager': 'Cheltenham Manager',
    'balwyn-facilitator': 'Balwyn Party Facilitator',
    'cheltenahm-facilitator': 'Cheltenham Party Facilitator',
    'essendon-facilitator': 'Essendon Party Facilitator',
    'malvern-facilitator': 'Malvern Party Facilitator',
}
