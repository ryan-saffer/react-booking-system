/// <reference lib="dom" />
import firebase, { firestore } from 'firebase' // https://stackoverflow.com/a/51275905/7870403
import { Locations } from "./Locations";
import { Creations } from './Creations'
import { CakeFlavours } from "./CakeFlavours";
import { Additions } from './Additions'

type AdditionKeys = keyof typeof Additions
type AdditionKeyValues = { [key in AdditionKeys]: boolean }

export interface BaseBooking extends AdditionKeyValues {
    parentFirstName: string,
    parentLastName: string,
    parentEmail: string,
    parentMobile: string,
    childName: string,
    childAge: string,
    location: Locations,
    partyLength: "1" | "1.5" | "2",
    address: string,
    numberOfChildren: string,
    notes: string,
    creation1: Creations | undefined,
    creation2: Creations | undefined,
    creation3: Creations | undefined,
    cake: string,
    cakeFlavour: CakeFlavours | undefined,
    questions: string,
    funFacts: string
}

export interface FirestoreBooking extends BaseBooking {
    dateTime: firestore.Timestamp,
}

export interface DomainBooking extends BaseBooking {
    date: Date,
    time: string,
}

type BookingKeys = { [K in keyof DomainBooking]: K }

export const DomainBookingFields: BookingKeys = {
    parentFirstName: "parentFirstName",
    parentLastName: "parentLastName",
    parentEmail: "parentEmail",
    parentMobile: "parentMobile",
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
    cake: 'cake',
    cakeFlavour: 'cakeFlavour',
    chickenNuggets: 'chickenNuggets',
    fairyBread: 'fairyBread',
    fruitPlatter: 'fruitPlatter',
    sandwichPlatter: 'sandwichPlatter',
    veggiePlatter: 'veggiePlatter',
    watermelonPlatter: 'watermelonPlatter',
    wedges: 'wedges',
    lollyBags: 'lollyBags',
    grazingPlatterMedium: 'grazingPlatterMedium',
    grazingPlatterLarge: 'grazingPlatterLarge'
}