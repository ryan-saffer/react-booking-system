import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { runAppsScript } from './index'
import { BookingFields, AppsScript, CreationDisplayValuesMap, Utilities, Additions } from 'fizz-kidz'

const db = admin.firestore()
db.settings({ignoreUndefinedProperties: true})

const CREATIONS_ADDITIONS_SPLIT_REGEX = /, ?(?=[A-Z])/ // split by ", [single capital letter]". make sure creations/additions never include this pattern
let isMobile = false // global

export const onFormSubmit = functions
    .region('australia-southeast1')
    .https.onRequest((req, res) => {
    
        const formResponse = req.body.values as string[]
        functions.logger.log(`formResponse: ${formResponse}`)
        isMobile = formResponse.length !== Object.keys(InStoreQuestions).length + 2 // +2 because InStoreQuestions indexing starts at 2 (Timestamp and party datetime not included)
        
        const parentName = formResponse[getIndex(BaseFormQuestion.ParentName)].split(" ")

        let collectionReference = db.collection('bookings')
            .where((BookingFields.parentFirstName), '==', parentName[0])
        // search by last name where possible
        if (parentName.length > 1) {
            collectionReference = collectionReference.where(BookingFields.parentLastName, "==", parentName.slice(1).join(" "))
        }
        collectionReference
            .where(BookingFields.childName, '==', formResponse[getIndex(BaseFormQuestion.ChildName)])
            .where(BookingFields.childAge, '==', formResponse[getIndex(BaseFormQuestion.ChildAge)])
            .where(BookingFields.location, '==', isMobile ? 'mobile' : formResponse[getIndex(InStoreAdditionalQuestion.Location)].toLowerCase())
            .where(BookingFields.dateTime, '>', new Date())
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    functions.logger.log("no booking found")
                    functions.logger.log(`calling apps script ${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_NOT_FOUND}`)
                    runAppsScript(AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_NOT_FOUND, [formResponse])
                        .then(_ => {
                            functions.logger.log(`${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_NOT_FOUND} finished successfully`)
                            res.status(200).send()
                        })
                        .catch(err => {
                            functions.logger.error(`error running ${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_NOT_FOUND}`)
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
                    
                    // determine if its the first time the form has been submitted or not
                    // if filled in previously, creation 1 will always be not null
                    // determine this now, because `updateBooking` will mutate the booking
                    const isFirstTimeSubmittingForm = !booking.creation1

                    functions.logger.log("mapping form to booking and updating in firestore")
                    updateBooking(formResponse, booking, documentSnapshot.ref)
                        .then(([updatedBooking, creations, additions]) => {
                            functions.logger.log("booking updated successfully")
                            functions.logger.log("updated booking:")
                            functions.logger.log(updatedBooking)

                            // only trigger confirmation emails (apps script booking found) if its the first time the form has been filled out
                            if (isFirstTimeSubmittingForm) {
                                functions.logger.log(`calling apps script ${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_FOUND}`)
                                runAppsScript(AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_FOUND, [updatedBooking, creations, additions])
                                    .then(_ => {
                                            functions.logger.log(`${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_FOUND} finished successfully`)
                                            res.status(200).send()
                                    })
                                    .catch(err => {
                                        functions.logger.error(`error running ${AppsScript.Functions.ON_FORM_SUBMIT_BOOKING_FOUND}`)
                                        functions.logger.error(err)
                                        res.status(500).send(err)
                                    })
                            } else {
                                functions.logger.log("form filled out previously, no need to send confirmation emails")
                                res.status(200).send()
                            }
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
    for (let i = getIndex(BaseFormQuestion.Creations1); i <= getIndex(BaseFormQuestion.Creations6); i++) {
        selectedCreations.push(...formResponse[i].split(CREATIONS_ADDITIONS_SPLIT_REGEX))
    }
    const filteredCreations = selectedCreations.filter(x => x !== '')
    filteredCreations.length = 3 // parent may have chosen more than 3 (max) creations.. use first 3
    booking.creation1 = Object.keys(CreationDisplayValuesMap).find(key => { if(Utilities.isObjKey(key, CreationDisplayValuesMap)) { return CreationDisplayValuesMap[key] === filteredCreations[0] }})
    booking.creation2 = Object.keys(CreationDisplayValuesMap).find(key => { if(Utilities.isObjKey(key, CreationDisplayValuesMap)) { return CreationDisplayValuesMap[key] === filteredCreations[1] }})
    booking.creation3 = Object.keys(CreationDisplayValuesMap).find(key => { if(Utilities.isObjKey(key, CreationDisplayValuesMap)) { return CreationDisplayValuesMap[key] === filteredCreations[2] }})

    let additions: string[] = []
    if (!isMobile) {
        // additions
        additions = formResponse[getIndex(InStoreAdditionalQuestion.Additions)].split(CREATIONS_ADDITIONS_SPLIT_REGEX)
        additions.forEach(addition => booking[AdditionsFormMap[addition]] = true)

        // cake
        booking.cake = formResponse[getIndex(InStoreAdditionalQuestion.Cake)]
        booking.cakeFlavour = formResponse[getIndex(InStoreAdditionalQuestion.CakeFlavour)].toLowerCase()
    }
    
    // questions
    booking.questions = formResponse[getIndex(BaseFormQuestion.Questions)]

    // fun facts
    booking.funFacts = formResponse[getIndex(BaseFormQuestion.FunFacts)]

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
    ChildName = 2,
    ChildAge = 3,
    NumberOfChildren = 4,
    Creations1 = 5,
    Creations2 = 6,
    Creations3 = 7,
    Creations4 = 8,
    Creations5 = 9,
    Creations6 = 10,
    FunFacts = 11,
    Questions = 12,
    FoundUs = 13
}

enum InStoreAdditionalQuestion {
    Location = 14, // start at 14 so as not to overwrite BaseFormQuestion indexing
    Additions = 15,
    CakeSelected = 16,
    Cake = 17,
    CakeFlavour = 18,
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
    [BaseFormQuestion.Creations6]: 12,
    [InStoreAdditionalQuestion.Additions]: 13,
    [InStoreAdditionalQuestion.CakeSelected]: 14,
    [InStoreAdditionalQuestion.Cake]: 15,
    [InStoreAdditionalQuestion.CakeFlavour]: 16,
    [BaseFormQuestion.FunFacts]: 17,
    [BaseFormQuestion.Questions]: 18,
    [BaseFormQuestion.FoundUs]: 19
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
    [BaseFormQuestion.Creations6]: 11,
    [BaseFormQuestion.FunFacts]: 12,
    [BaseFormQuestion.Questions]: 13,
    [BaseFormQuestion.FoundUs]: 14
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
    funFacts?: string,
    grazingPlatterMedium?: string,
    grazingPlatterLarge?: string,
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

const AdditionsFormMap: { [key: string]: string } = {
    "Chicken Nuggets - $30": Additions.chickenNuggets,
    "Fairy Bread - $25": Additions.fairyBread,
    "Fruit Platter - $40": Additions.fruitPlatter,
    "Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $30": Additions.sandwichPlatter,
    "Veggie Platter - $30": Additions.veggiePlatter,
    "Watermelon Platter - $20": Additions.watermelonPlatter,
    "Wedges - $25": Additions.wedges,
    "Lolly bags - $2.50 per child": Additions.lollyBags,
    "Grazing Platter for Parents (Medium: 10-15 ppl) - $98": Additions.grazingPlatterMedium,
    "Grazing Platter for Parents (Large: 15-25 ppl) - $148": Additions.grazingPlatterLarge
}