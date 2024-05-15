/// <reference lib="dom" />
import { firestore } from 'firebase-admin' // https://stackoverflow.com/a/51275905/7870403

import { Location } from '../core/location'
import { Additions } from './Additions'
import { CakeFlavours } from './CakeFlavours'
import { Creations } from './Creations'

type AdditionKeys = keyof typeof Additions
type AdditionKeyValues = { [key in AdditionKeys]: boolean }

export interface BaseBooking extends AdditionKeyValues {
    eventId?: string
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentMobile: string
    childName: string
    childAge: string
    location: Location
    type: 'studio' | 'mobile'
    partyLength: '1' | '1.5' | '2'
    address: string
    numberOfChildren: string
    notes: string
    creation1: Creations | undefined
    creation2: Creations | undefined
    creation3: Creations | undefined
    menu: 'standard' | 'glutenFree' | 'vegan' | undefined
    cake: string
    cakeFlavour: CakeFlavours | undefined
    questions: string
    funFacts: string
    partyFormFilledIn: boolean
    sendConfirmationEmail: boolean
    oldPrices: boolean
}

// separates date and time into separate values, for better use in forms
export interface FormBooking extends BaseBooking {
    date: Date
    time: Date
}

// combines dateTime into single date
export interface Booking extends BaseBooking {
    dateTime: Date
}

// used when retrieving from firestore, where dateTime is a firestore Timestamp
export interface FirestoreBooking extends BaseBooking {
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
}

type BookingKeys = { [K in keyof FirestoreBooking]: K }

export const BookingFields: BookingKeys = {
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
}
