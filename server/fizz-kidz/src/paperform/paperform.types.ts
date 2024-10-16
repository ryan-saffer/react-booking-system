import { Booking, WWCC } from '..'

export type PFProduct = { SKU: string; quantity: number }
export type PFFile = { url: string; name: string; type: string }

export type PartyForm = {
    id: string
    location: string
    parent_first_name: string
    parent_last_name: string
    child_name: string
    child_age: string
    number_of_children_in_store: string
    number_of_children_mobile: string
    glam_creations: PFProduct[]
    science_creations: PFProduct[]
    slime_creations: PFProduct[]
    safari_creations: PFProduct[]
    unicorn_creations: PFProduct[]
    tie_dye_creations: PFProduct[]
    taylor_swift_creations: PFProduct[]
    expert_creations: PFProduct[]
    additions: string[]
    party_packs: PFProduct[]
    fun_facts: string
    questions: string
}

export type PartyFormV2 = {
    id: string
    location: string
    parent_first_name: string
    parent_last_name: string
    child_name: string
    child_age: string
    number_of_children_in_store: string
    number_of_children_mobile: string
    glam_creations: PFProduct[]
    science_creations: PFProduct[]
    slime_creations: PFProduct[]
    safari_creations: PFProduct[]
    unicorn_creations: PFProduct[]
    tie_dye_creations: PFProduct[]
    taylor_swift_creations: PFProduct[]
    expert_creations: PFProduct[]
    food_package: string
    additions: string[]
    party_packs: PFProduct[]
    fun_facts: string
    questions: string
}

export type PartyFormV3 = {
    id: string
    location: string
    parent_first_name: string
    parent_last_name: string
    child_name: string
    child_age: string
    number_of_children_in_store: string
    number_of_children_mobile: string
    glam_creations: PFProduct[]
    science_creations: PFProduct[]
    slime_creations: PFProduct[]
    safari_creations: PFProduct[]
    unicorn_creations: PFProduct[]
    tie_dye_creations: PFProduct[]
    taylor_swift_creations: PFProduct[]
    expert_creations: PFProduct[]
    menu: Booking['menu']
    additions: string[]
    party_packs: PFProduct[]
    fun_facts: string
    questions: string
}

export type OnboardingForm = {
    id: string
    firstName: string
    lastName: string
    pronouns: string
    dob: string
    email: string
    mobile: string
    address: string
    address_street: string
    address_suburb: string
    address_state: string
    address_postcode: string
    health: string
    wwccStatus: WWCC['status']
    wwccPhoto: PFFile
    wwccCardNumber: string
    wwccApplicationNumber: string
    tfnForm: PFFile
    bankAccountName: string
    bsb: string
    accountNumber: string
    emergencyContactName: string
    emergencyContactMobile: string
    emergencyContactRelation: string
}

export type IncursionForm = {
    id: string
    organisation: string
    address: string
    numberOfChildren: string
    location: string
    parking: string
    expectedLearning: string
    teacherInformation: string
    additionalInformation: string
    hearAboutUs: string
}
