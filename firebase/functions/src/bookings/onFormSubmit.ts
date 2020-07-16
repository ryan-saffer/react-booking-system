import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as BookingConstants from '../constants/bookings'
import { runAppsScript } from './index'

const db = admin.firestore()
db.settings({ignoreUndefinedProperties: true})

export const onFormSubmit = functions.https.onRequest((req, res) => {
    
    const formResponse = req.body.values as [string]

    for (const key in InStoreQuestions) {
        functions.logger.log(formResponse[InStoreQuestions[key]])
    }

    const parentName = formResponse[InStoreQuestions.parentName].split(" ")

    let collectionReference = db.collection('bookings')
        .where(BookingConstants.fields.PARENT_FIRST_NAME, '==', parentName[0])
    // search by last name where possible
    if (parentName.length > 1) {
        collectionReference = collectionReference.where(BookingConstants.fields.PARENT_LAST_NAME, "==", parentName[1])
    }
    collectionReference
        .where(BookingConstants.fields.CHILD_NAME, '==', formResponse[InStoreQuestions.childName])
        .where(BookingConstants.fields.CHILD_AGE, '==', formResponse[InStoreQuestions.childAge])
        .where(BookingConstants.fields.LOCATION, '==', formResponse[InStoreQuestions.location].toLowerCase())
        .where(BookingConstants.fields.DATE_TIME, '>', new Date())
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                functions.logger.log("no booking found")
                runAppsScript('onFormSubmitBookingNotFound', [formResponse])
                    .then(_ => res.status(200).send())
                    .catch(err => {
                        functions.logger.error(err)
                        res.status(500).send(err)
                    })
            } else {
                functions.logger.log("Booking found!")
                const documentSnapshot = querySnapshot.docs[0]
                const booking = documentSnapshot.data() as Booking
                functions.logger.log("Existing booking:")
                functions.logger.log(booking)
                if (isTimestamp(booking.dateTime)) {
                    booking.dateTime = booking.dateTime.toDate()
                }
                updateBooking(formResponse, booking, documentSnapshot.ref)
                    .then(([updatedBooking, creations, additions]) => {
                        console.log(updatedBooking)
                        console.log(additions)
                        runAppsScript('onFormSubmitBookingFound', [updatedBooking, creations, additions])
                            .then(_ => res.status(200).send())
                            .catch(err => {
                                functions.logger.error(err)
                                res.status(500).send(err)
                            })
                    })
                    .catch(err => {
                        functions.logger.error(err)
                        res.status(500).send(err)
                    })
            }
        })
        .catch(err => {
            functions.logger.error(err)
            res.status(500).send(err)
        })
})

const isTimestamp = (dateTime: any): dateTime is admin.firestore.Timestamp => true

async function updateBooking(formResponse: [string], booking: Booking, ref: FirebaseFirestore.DocumentReference): Promise<[Booking, Array<string>, Array<string>]> {
    const [updatedBooking, creations, additions] = mapFormResponseToBooking(formResponse, booking)
    functions.logger.log("Updated booking:")
    functions.logger.log(updatedBooking)
    Object.keys(updatedBooking).forEach(key => updatedBooking[key] === undefined && delete updatedBooking[key])    
    await ref.update(updatedBooking)
    return [updatedBooking, creations, additions]
}

function mapFormResponseToBooking(formResponse: [string], booking: Booking): [Booking, Array<string>, Array<string>] {
    // number of children
    booking.numberOfChildren = formResponse[InStoreQuestions.numberOfChildren]

    // creations
    const selectedCreations = []
    for (let i = InStoreQuestions.creations1; i <= InStoreQuestions.creations5; i++) {
        selectedCreations.push(...formResponse[i].split(/, ?(?=[A-Z])/)) // split by ", [single capital letter]". make sure creations never include this pattern
    }
    console.log("CREATIONS:")
    console.log(selectedCreations)
    const filteredCreations = selectedCreations.filter(x => x !== '')
    filteredCreations.length = 3 // parent may have chosen more than 3 (max) creations.. use first 3
    booking.creation1 = CreationFormsMap[filteredCreations[0]]
    booking.creation2 = CreationFormsMap[filteredCreations[1]]
    booking.creation3 = CreationFormsMap[filteredCreations[2]]

    // additions
    const additions = formResponse[InStoreQuestions.additions].split(/, ?(?=[A-Z])/)
    console.log(additions)
    for (const addition of additions) {
        booking[AdditionsFormMap[addition]] = true
    }

    // cake
    booking.cake = formResponse[InStoreQuestions.cake]
    booking.cakeFlavour = formResponse[InStoreQuestions.cakeFlavour].toLowerCase()
    
    // questions
    booking.questions = formResponse[InStoreQuestions.questions]

    return [booking, filteredCreations, additions]
}

type Questions = {
    parentName: number,
    childName: number,
    childAge: number,
    location: number,
    numberOfChildren: number,
    creations1: number,
    creations2: number,
    creations3: number,
    creations4: number,
    creations5: number,
    additions: number,
    cakeSelected: number,
    cake: number,
    cakeFlavour: number,
    funFacts: number,
    questions: number,
    foundUs: number
    [key: string]: number
}

const InStoreQuestions: Questions = {
    parentName: 2,
    childName: 3,
    childAge: 4,
    location: 5,
    numberOfChildren: 6,
    creations1: 7,
    creations2: 8,
    creations3: 9,
    creations4: 10,
    creations5: 11,
    additions: 12,
    cakeSelected: 13,
    cake: 14,
    cakeFlavour: 15,
    funFacts: 16,
    questions: 17,
    foundUs: 18
}

type Booking = {
    address?: string,
    cake?: string,
    cakeFlavour?: string,
    chickenNuggets?: boolean,
    childAge: string,
    childName: string,
    creation1?: string,
    creation2?: string,
    creation3?: string,
    dateTime: admin.firestore.Timestamp | Date,
    eventId: string,
    fairBready?: boolean,
    fruitPlatter?: boolean,
    location: string,
    lollyBags?: boolean,
    notes: string,
    numberOfChildren?: string,
    parentEmail: string,
    parentFirstName: string,
    parentLastName: string,
    parentMobile: string,
    partyLength: string,
    questions?: string,
    sandwichPlatter?: string,
    sendConfirmationEmail: boolean,
    veggiePlater?: boolean,
    watermelonPlatter?: boolean,
    wedges?: boolean,
    [key: string]: any
}

type StringMap = {
    [key: string]: string
}

const CreationFormsMap: StringMap = {
    "Fairy Bath-Bombs": "fairyBathBombs",
    "Glitter Face Paint": "glitterFacePaint",
    "Rainbow Bath Crystals": "rainbowBathCrystals",
    "Rainbow Soap": "rainbowSoap",
    "Sparkling Lip-Balm": "lipBalm",
    "Shining Perfume": "perfume",
    "Sparkling unicorn, star or heart Glitter Soap": "soap",
    "Bubbling Lava lamps": "lavaLamps",
    "Bugs in Soap": "bugsInSoap",
    "Fizzy Bath-Bombs": "bathBombs",
    "Galaxy Soap": "galaxySoap",
    "Monster Slime": "monsterSlime",
    "Wobbly Soap": "wobblySoap",
    "Fluffy Slime": "fluffySlime",
    "Galaxy Slime": "galaxySlime",
    "Glitter Slime": "glitterSlime",
    "Fairy Slime": "fairySlime",
    "Cupcake Bath-Bombs": "bathBombs",
    "Large Fizzing Bath-Bombs": "bathBombs",
    "Sparkling Soap - star, heart, flower, unicorn or fish shaped": "soap",
    "Expert Galaxy Slime": "expertGalaxySlime",
    "Expert Rainbow Bath-Bombs": "expertRainbowBathBombs",
    "Expert Rainbow Slime": "expertRainbowSlime",
    "Expert Rainbow Soap": "expertRainbowSoap",
    "Expert Watermelon Bath-Bombs": "expertWatermelonBathBombs",
    "Expert Galaxy Bath-Bombs": "expertGalaxyBathBombs"
}

const AdditionsFormMap: StringMap = {
    "Chicken Nuggets - $30": "chickenNuggets",
    "Fairy Bread - $25": "fairyBread",
    "Fruit Platter - $40": "fruitPlatter",
    "Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $30": "sandwichPlatter",
    "Veggie Platter - $30": "veggiePlatter",
    "Watermelon Platter - $20": "watermelonPlatter",
    "Wedges - $25": "wedges",
    "Lolly bags - $2.50 per child": "lollyBags"
}