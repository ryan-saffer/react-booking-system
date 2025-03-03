import { WWCC } from '..'

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
    glam_creations: string[]
    science_creations: string[]
    slime_creations: string[]
    fairy_creations: string[]
    fluid_bear_creations: string[]
    safari_creations: string[]
    unicorn_creations: string[]
    tie_dye_creations: string[]
    taylor_swift_creations: string[]
    glam_creations_mobile: string[]
    science_creations_mobile: string[]
    slime_creations_mobile: string[]
    fairy_creations_mobile: string[]
    fluid_bear_creations_mobile: string[]
    safari_creations_mobile: string[]
    unicorn_creations_mobile: string[]
    tie_dye_creations_mobile: string[]
    taylor_swift_creations_mobile: string[]
    food_package: string
    additions: string[]
    cake: string
    cake_size: 'small_cake' | 'medium_cake' | 'large_cake'
    cake_flavours: string[]
    cake_served: 'cup' | 'waffle_cones' | 'bring_own_bowls'
    cake_candles: 'include_candles' | 'bring_own_candles'
    cake_message: string
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
    glam_creations: string[]
    science_creations: string[]
    slime_creations: string[]
    fairy_creations: string[]
    fluid_bear_creations: string[]
    safari_creations: string[]
    unicorn_creations: string[]
    tie_dye_creations: string[]
    taylor_swift_creations: string[]
    glam_creations_mobile: string[]
    science_creations_mobile: string[]
    slime_creations_mobile: string[]
    fairy_creations_mobile: string[]
    fluid_bear_creations_mobile: string[]
    safari_creations_mobile: string[]
    unicorn_creations_mobile: string[]
    tie_dye_creations_mobile: string[]
    taylor_swift_creations_mobile: string[]
    food_package: string
    additions: string[]
    cake: string
    cake_size: 'small_cake' | 'medium_cake' | 'large_cake'
    cake_flavours: string[]
    cake_served: 'cup' | 'waffle_cones' | 'bring_own_bowls'
    cake_candles: 'include_candles' | 'bring_own_candles'
    cake_message: string
    party_packs: string | undefined // not array because do not allow multiple selection
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
