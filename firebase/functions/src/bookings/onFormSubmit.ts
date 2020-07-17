import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as BookingConstants from '../constants/bookings'
import { runAppsScript } from './index'

const db = admin.firestore()
db.settings({ignoreUndefinedProperties: true})

let isMobile = false // global
export const onFormSubmit = functions
    .region('australia-southeast1')
    .https.onRequest((req, res) => {
    
        const formResponse = req.body.values as string[]
        functions.logger.log(`formResponse: ${formResponse}`)
        isMobile = formResponse.length !== 19
        
        const parentName = formResponse[getIndex(BaseFormQuestion.ParentName)].split(" ")

        let collectionReference = db.collection('bookings')
            .where(BookingConstants.fields.PARENT_FIRST_NAME, '==', parentName[0])
        // search by last name where possible
        if (parentName.length > 1) {
            collectionReference = collectionReference.where(BookingConstants.fields.PARENT_LAST_NAME, "==", parentName[1])
        }
        collectionReference
            .where(BookingConstants.fields.CHILD_NAME, '==', formResponse[getIndex(BaseFormQuestion.ChildName)])
            .where(BookingConstants.fields.CHILD_AGE, '==', formResponse[getIndex(BaseFormQuestion.ChildAge)])
            .where(BookingConstants.fields.LOCATION, '==', isMobile ? 'mobile' : formResponse[getIndex(InStoreAdditionalQuestion.Location)].toLowerCase())
            .where(BookingConstants.fields.DATE_TIME, '>', new Date())
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    functions.logger.log("no booking found")
                    functions.logger.log('calling apps script onFormSubmitBookingNotFound')
                    runAppsScript('onFormSubmitBookingNotFound', [formResponse])
                        .then(_ => {
                            functions.logger.log("onFormSubmitBookingNotFound finished successfully")
                            res.status(200).send()
                        })
                        .catch(err => {
                            functions.logger.error("error running onFormSubmitBookingNotFound")
                            functions.logger.error(err)
                            res.status(500).send(err)
                        })
                } else {
                    functions.logger.log("matching booking successfully found in firestore")
                    const documentSnapshot = querySnapshot.docs[0]
                    const booking = documentSnapshot.data() as Booking
                    functions.logger.log("existing booking:")
                    functions.logger.log(booking)
                    if (isTimestamp(booking.dateTime)) {
                        booking.dateTime = booking.dateTime.toDate()
                    }
                    functions.logger.log("mapping form to booking and updating in firestore")
                    updateBooking(formResponse, booking, documentSnapshot.ref)
                        .then(([updatedBooking, creations, additions]) => {
                            functions.logger.log("booking updated successfully")
                            functions.logger.log("updated booking:")
                            functions.logger.log(updatedBooking)
                            functions.logger.log("calling apps script onFormSubmitBookingFound")
                            runAppsScript('onFormSubmitBookingFound', [updatedBooking, creations, additions])
                                .then(_ => {
                                        functions.logger.log("onFormSubmitBookingFound finished successfully")
                                        res.status(200).send()
                                })
                                .catch(err => {
                                    functions.logger.error("error running onFormSubmitBookingFound")
                                    functions.logger.error(err)
                                    res.status(500).send(err)
                                })
                        })
                        .catch(err => {
                            functions.logger.error("error updating booking")
                            functions.logger.error(err)
                            res.status(500).send(err)
                        })
                }
            })
            .catch(err => {
                functions.logger.error("error querying firestore for booking")
                functions.logger.error(err)
                res.status(500).send(err)
            })
})

const isTimestamp = (dateTime: any): dateTime is admin.firestore.Timestamp => true

async function updateBooking(formResponse: string[], booking: Booking, ref: FirebaseFirestore.DocumentReference): Promise<[Booking, Array<string>, Array<string>]> {
    const [updatedBooking, creations, additions] = mapFormResponseToBooking(formResponse, booking)
    Object.keys(updatedBooking).forEach(key => updatedBooking[key] === undefined && delete updatedBooking[key])    
    await ref.update(updatedBooking)
    return [updatedBooking, creations, additions]
}

function mapFormResponseToBooking(formResponse: string[], booking: Booking): [Booking, string[], string[]] {
    // number of children
    booking.numberOfChildren = formResponse[getIndex(BaseFormQuestion.NumberOfChildren)]

    // creations
    const selectedCreations = []
    for (let i = getIndex(BaseFormQuestion.Creations1); i <= getIndex(BaseFormQuestion.Creations5); i++) {
        selectedCreations.push(...formResponse[i].split(/, ?(?=[A-Z])/)) // split by ", [single capital letter]". make sure creations never include this pattern
    }
    const filteredCreations = selectedCreations.filter(x => x !== '')
    filteredCreations.length = 3 // parent may have chosen more than 3 (max) creations.. use first 3
    booking.creation1 = CreationFormsMap[filteredCreations[0]]
    booking.creation2 = CreationFormsMap[filteredCreations[1]]
    booking.creation3 = CreationFormsMap[filteredCreations[2]]

    let additions: string[] = []
    if (!isMobile) {
        // additions
        additions = formResponse[getIndex(InStoreAdditionalQuestion.Additions)].split(/, ?(?=[A-Z])/)
        for (const addition of additions) {
            booking[AdditionsFormMap[addition]] = true
        }

        // cake
        booking.cake = formResponse[getIndex(InStoreAdditionalQuestion.Cake)]
        booking.cakeFlavour = formResponse[getIndex(InStoreAdditionalQuestion.CakeFlavour)].toLowerCase()
    }
    
    // questions
    booking.questions = formResponse[getIndex(BaseFormQuestion.Questions)]

    // fun facts
    booking.questions += `\n\n${formResponse[getIndex(BaseFormQuestion.FunFacts)]}`

    return [booking, filteredCreations, additions]
}

const isBaseFormQuestion = (question: any): question is BaseFormQuestion => true

/**
 * Returns the index from the form response string array, and returns the correct value.
 * Uses the global isMobile property.
 * NOTE: If requesting an InStoreAdditonalQuestion on a mobile form response array, this function will return undefined.
 * Any calls to this function when providing an InStoreAddtionalQuestion should be inside an if(!isMobile) {} clause.
 *
 * @param question the form question for which an index is required
 */
function getIndex(question: BaseFormQuestion | InStoreAdditionalQuestion) {
    if (isMobile) {
        if (isBaseFormQuestion(question)) {
            return MobileQuestions[question]
        } else {
            throw new Error(`attempted to access index of MobileQuestions that does not exist. Index: ${question}`)
        }
    } else {
        return InStoreQuestions[question]
    }
}

enum BaseFormQuestion {
    ParentName = 1,
    ChildName,
    ChildAge,
    NumberOfChildren,
    Creations1,
    Creations2,
    Creations3,
    Creations4,
    Creations5,
    FunFacts,
    Questions,
    FoundUs
}

enum InStoreAdditionalQuestion {
    Location = 13, // start at 13 so as not to overwrite BaseFormQuestion indexing
    Additions,
    CakeSelected,
    Cake,
    CakeFlavour,
}

type MobileQuestionsIndexMap = { [key in BaseFormQuestion]: number }
type InStoreQuestionsIndexMap = MobileQuestionsIndexMap & { [key in InStoreAdditionalQuestion] : number}

const InStoreQuestions: InStoreQuestionsIndexMap = {
    [BaseFormQuestion.ParentName]: 2,
    [BaseFormQuestion.ChildName]: 3,
    [BaseFormQuestion.ChildAge]: 4,
    [InStoreAdditionalQuestion.Location]: 5,
    [BaseFormQuestion.NumberOfChildren]: 6,
    [BaseFormQuestion.Creations1]: 7,
    [BaseFormQuestion.Creations2]: 8,
    [BaseFormQuestion.Creations3]: 9,
    [BaseFormQuestion.Creations4]: 10,
    [BaseFormQuestion.Creations5]: 11,
    [InStoreAdditionalQuestion.Additions]: 12,
    [InStoreAdditionalQuestion.CakeSelected]: 13,
    [InStoreAdditionalQuestion.Cake]: 14,
    [InStoreAdditionalQuestion.CakeFlavour]: 15,
    [BaseFormQuestion.FunFacts]: 16,
    [BaseFormQuestion.Questions]: 17,
    [BaseFormQuestion.FoundUs]: 18
}

const MobileQuestions: MobileQuestionsIndexMap = {
    [BaseFormQuestion.ParentName]: 2,
    [BaseFormQuestion.ChildName]: 3,
    [BaseFormQuestion.ChildAge]: 4,
    [BaseFormQuestion.NumberOfChildren]: 5,
    [BaseFormQuestion.Creations1]: 6,
    [BaseFormQuestion.Creations2]: 7,
    [BaseFormQuestion.Creations3]: 8,
    [BaseFormQuestion.Creations4]: 9,
    [BaseFormQuestion.Creations5]: 10,
    [BaseFormQuestion.FunFacts]: 11,
    [BaseFormQuestion.Questions]: 12,
    [BaseFormQuestion.FoundUs]: 13
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