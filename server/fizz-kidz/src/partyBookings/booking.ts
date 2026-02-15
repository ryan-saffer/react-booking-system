/// <reference lib="dom" />
import type { firestore } from 'firebase-admin' // https://stackoverflow.com/a/51275905/7870403
import type { Studio } from 'fizz-kidz/src/core/studio'

import type { CakeFlavours } from './CakeFlavours'
import type { Addition } from './additions'
import type { Creation } from './creations'
import type { ProductType } from './products'
import type { TakeHomeBagType } from './take-home-bags'

type AdditionKeyValues = Record<Addition, boolean>

export interface BaseBooking extends AdditionKeyValues {
    eventId?: string
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentMobile: string
    childName: string
    childAge: string
    location: Studio
    type: 'studio' | 'mobile'
    partyLength: '1' | '1.5' | '2'
    address: string
    numberOfChildren: string
    notes: string
    creation1: Creation | undefined
    creation2: Creation | undefined
    creation3: Creation | undefined
    menu: 'standard' | 'glutenFree' | 'vegan' | undefined
    cakeFlavour: CakeFlavours | undefined
    questions: string
    funFacts: string
    partyFormFilledIn: boolean
    sendConfirmationEmail: boolean
    oldPrices: boolean
    includesFood: boolean
    cake?: {
        selection: string
        flavours: string[]
        size: string
        served: string // bowls + spoon, waffle cones, bring their own
        candles: string
        message?: string
    }
    takeHomeBags?: Partial<Record<TakeHomeBagType, number>>
    products?: Partial<Record<ProductType, number>>
}

// separates date and time into separate values, for better use in forms
export interface FormBooking extends BaseBooking {
    date: Date
    time: Date
}

// combines dateTime into single date
export interface Booking extends BaseBooking {
    createdAt: Date
    dateTime: Date
}

// used when retrieving from firestore, where dateTime is a firestore Timestamp
export interface FirestoreBooking extends BaseBooking {
    createdAt: firestore.Timestamp
    dateTime: firestore.Timestamp
}

type FormBookingKeys = { [K in keyof FormBooking]: K }

export const FormBookingFields: FormBookingKeys = {
    parentFirstName: 'parentFirstName',
    parentLastName: 'parentLastName',
    parentEmail: 'parentEmail',
    parentMobile: 'parentMobile',
    childName: 'childName',
    childAge: 'childAge',
    location: 'location',
    type: 'type',
    address: 'address',
    date: 'date',
    time: 'time',
    partyLength: 'partyLength',
    notes: 'notes',
    questions: 'questions',
    funFacts: 'funFacts',
    numberOfChildren: 'numberOfChildren',
    creation1: 'creation1',
    creation2: 'creation2',
    creation3: 'creation3',
    menu: 'menu',
    partyFormFilledIn: 'partyFormFilledIn',
    cake: 'cake',
    cakeFlavour: 'cakeFlavour',
    chickenNuggets: 'chickenNuggets',
    fairyBread: 'fairyBread',
    fruitPlatter: 'fruitPlatter',
    glutenFreeFairyBread: 'glutenFreeFairyBread',
    potatoGems: 'potatoGems',
    frankfurts: 'frankfurts',
    sandwichPlatter: 'sandwichPlatter',
    vegetarianSpringRolls: 'vegetarianSpringRolls',
    veggiePlatter: 'veggiePlatter',
    vegetarianQuiche: 'vegetarianQuiche',
    watermelonPlatter: 'watermelonPlatter',
    wedges: 'wedges',
    lollyBags: 'lollyBags',
    grazingPlatterMedium: 'grazingPlatterMedium',
    grazingPlatterLarge: 'grazingPlatterLarge',
    volcanoPartyPack: 'volcanoPartyPack',
    lipBalmPartyPack: 'lipBalmPartyPack',
    dinosaurBathBombPartyPack: 'dinosaurBathBombPartyPack',
    slimePartyPack: 'slimePartyPack',
    sendConfirmationEmail: 'sendConfirmationEmail',
    oldPrices: 'oldPrices',
    includesFood: 'includesFood',
    dinosaurFizzPartyPack: 'dinosaurFizzPartyPack',
    unicornFizzPartyPack: 'unicornFizzPartyPack',
    takeHomeBags: 'takeHomeBags',
    products: 'products',
}

type BookingKeys = { [K in keyof FirestoreBooking]: K }

export const BookingFields: BookingKeys = {
    createdAt: 'createdAt',
    parentFirstName: 'parentFirstName',
    parentLastName: 'parentLastName',
    parentEmail: 'parentEmail',
    parentMobile: 'parentMobile',
    childName: 'childName',
    childAge: 'childAge',
    location: 'location',
    type: 'type',
    address: 'address',
    dateTime: 'dateTime',
    partyLength: 'partyLength',
    notes: 'notes',
    questions: 'questions',
    funFacts: 'funFacts',
    numberOfChildren: 'numberOfChildren',
    creation1: 'creation1',
    creation2: 'creation2',
    creation3: 'creation3',
    partyFormFilledIn: 'partyFormFilledIn',
    cake: 'cake',
    menu: 'menu',
    cakeFlavour: 'cakeFlavour',
    chickenNuggets: 'chickenNuggets',
    fairyBread: 'fairyBread',
    glutenFreeFairyBread: 'glutenFreeFairyBread',
    potatoGems: 'potatoGems',
    fruitPlatter: 'fruitPlatter',
    frankfurts: 'frankfurts',
    sandwichPlatter: 'sandwichPlatter',
    vegetarianSpringRolls: 'vegetarianSpringRolls',
    veggiePlatter: 'veggiePlatter',
    vegetarianQuiche: 'vegetarianQuiche',
    watermelonPlatter: 'watermelonPlatter',
    wedges: 'wedges',
    lollyBags: 'lollyBags',
    grazingPlatterMedium: 'grazingPlatterMedium',
    grazingPlatterLarge: 'grazingPlatterLarge',
    volcanoPartyPack: 'volcanoPartyPack',
    lipBalmPartyPack: 'lipBalmPartyPack',
    dinosaurBathBombPartyPack: 'dinosaurBathBombPartyPack',
    slimePartyPack: 'slimePartyPack',
    sendConfirmationEmail: 'sendConfirmationEmail',
    oldPrices: 'oldPrices',
    includesFood: 'includesFood',
    dinosaurFizzPartyPack: 'dinosaurFizzPartyPack',
    unicornFizzPartyPack: 'unicornFizzPartyPack',
    takeHomeBags: 'takeHomeBags',
    products: 'products',
}
