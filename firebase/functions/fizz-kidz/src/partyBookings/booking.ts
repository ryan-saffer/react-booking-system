/// <reference lib="dom" />
import { firestore } from 'firebase-admin' // https://stackoverflow.com/a/51275905/7870403
import { Locations } from './Locations'
import { Creations } from './Creations'
import { CakeFlavours } from './CakeFlavours'
import { Additions } from './Additions'

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
    location: Locations
    partyLength: '1' | '1.5' | '2'
    address: string
    numberOfChildren: string
    notes: string
    creation1: Creations | undefined
    creation2: Creations | undefined
    creation3: Creations | undefined
    cake: string
    cakeFlavour: CakeFlavours | undefined
    questions: string
    funFacts: string
    partyFormFilledIn: boolean
    sendConfirmationEmail: boolean
}

// separates date and time into separate values, for better use in forms
export interface FormBooking extends BaseBooking {
    date: Date
    time: string
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
    partyFormFilledIn: 'partyFormFilledIn',
    cake: 'cake',
    cakeFlavour: 'cakeFlavour',
    chickenNuggets: 'chickenNuggets',
    fairyBread: 'fairyBread',
    fruitPlatter: 'fruitPlatter',
    frankfurts: 'frankfurts',
    sandwichPlatter: 'sandwichPlatter',
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
    cakeFlavour: 'cakeFlavour',
    chickenNuggets: 'chickenNuggets',
    fairyBread: 'fairyBread',
    fruitPlatter: 'fruitPlatter',
    frankfurts: 'frankfurts',
    sandwichPlatter: 'sandwichPlatter',
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
}
