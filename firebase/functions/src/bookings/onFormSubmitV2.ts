import { Booking, Additions, Creations } from 'fizz-kidz';

import * as functions from 'firebase-functions'
import { Locations } from 'fizz-kidz/lib';
// import * as admin from 'firebase-admin'
// import { runAppsScript } from './index'
import { db } from '../index'

// db.settings({ignoreUndefinedProperties: true})

type PFProduct = { SKU: string, quantity: number }

type Questions = {
    'id': string,
    'location': string,
    'parent_first_name': string,
    'parent_last_name': string,
    'child_name': string,
    'child_age': string,
    "number_of_children_in_store": string,
    "number_of_children_mobile": string,
    "glam_creations": PFProduct[],
    "science_creations": PFProduct[],
    "slime_creations": PFProduct[],
    "safari_creations": PFProduct[],
    "unicorn_creations": PFProduct[],
    "tie_dye_creations": PFProduct[],
    "additions": string[],
    "fun_facts": string,
    "questions": string
}

type PFQuestion<T extends keyof Questions> = {
    title: string,
    description: string,
    key: string,
    custom_key: T,
    value: Questions[T]
}

export const onFormSubmitV2 = functions
    .region('australia-southeast1')
    .https.onRequest((req, res) => {

        console.log(req.body.data)

        const responses = req.body.data as PFQuestion<any>[]
        
        let id = getQuestionValue(responses, 'id')

        // first the text questions
        try {

            let booking: Partial<Booking> = {
                ...getSharedQuestions(responses)
            }
            
            // number of children are different types of question depending on mobile or not
            booking['numberOfChildren'] = booking.location === 'mobile'
                ? getQuestionValue(responses, 'number_of_children_mobile')
                : getQuestionValue(responses, 'number_of_children_in_store')

            // additions only for in store
            if (booking.location !== 'mobile') {
                booking = {
                    ...booking,
                    ...getAdditions(responses)
                }
            }
            console.log(booking)

            // write to firestore
            // db.doc(`bookings/${id}`).set(booking, { merge: true })

            res.status(200).send()
        } catch (e) {
            res.status(500).send(e)
        }

    })

/**
 * Return a booking object with all values from questions
 * shared across both in-store and mobile
 */
function getSharedQuestions(responses: PFQuestion<any>[]) {

    let creations = getCreations(responses)

    let booking: Partial<Booking> = {
        location: mapLocation(getQuestionValue(responses, 'location')),
        parentFirstName: getQuestionValue(responses, 'parent_first_name'),
        parentLastName: getQuestionValue(responses, 'parent_last_name'),
        childName: getQuestionValue(responses, 'child_name'),
        childAge: getQuestionValue(responses, 'child_age'),
        creation1: creations.length > 0 ? creations[0] : undefined,
        creation2: creations.length > 1 ? creations[1] : undefined,
        creation3: creations.length > 3 ? creations[2] : undefined,
        funFacts: getQuestionValue(responses, 'fun_facts'),
        questions: getQuestionValue(responses, 'questions')
    }

    return booking
}

function mapLocation(location: string) {
    if (isValidLocation(location)) {
        return location
    } else {
        console.error(`Form included invalid location: ${location}`)
        throw new Error(`Form included invalid location: ${location}`)
    }
}

function isValidLocation(location: string): location is Locations {
    return (<any>Object).values(Locations).includes(location)
}

/**
 * Returns an array of SKUs for all selected creations.
 */
function getCreations(responses: PFQuestion<any>[]) {
    let creationSkus = [
        ...mapProductToSku(getQuestionValue(responses, 'glam_creations')),
        ...mapProductToSku(getQuestionValue(responses, 'science_creations')),
        ...mapProductToSku(getQuestionValue(responses, 'slime_creations')),
        ...mapProductToSku(getQuestionValue(responses, 'safari_creations')),
        ...mapProductToSku(getQuestionValue(responses, 'unicorn_creations')),
        ...mapProductToSku(getQuestionValue(responses, 'tie_dye_creations'))
    ]

    // filter out any duplicate creation selections
    let filteredSkus = [...new Set(creationSkus)]

    let creations = filteredSkus.map(creation => {
        if (isValidCreation(creation)) {
            return creation
        } else {
            console.error(`invalid creation SKU found: ${creation}`)
            throw new Error(`invalid creation SKU found: ${creation}`)
        }
    })

    return creations
}

const mapProductToSku = (products: PFProduct[]) => products.map(it => {
    return it.SKU.includes('_') ? it.SKU.substring(0, it.SKU.indexOf('_')) : it.SKU
})

function isValidCreation(creation: string): creation is Creations {
    return Object.keys(Creations).includes(creation)
}

function getAdditions(responses: PFQuestion<any>[]) {
    let additions = getQuestionValue(responses, 'additions')
    additions.forEach((addition, index, array) => array[index] = AdditionsFormMap[addition])
    let booking: Partial<Booking> = {}
    additions.forEach(addition => {
        if (isValidAddition(addition)) {
            booking[addition] = true
        }
    })
    
    return booking
}

function isValidAddition(addition: string): addition is Additions {
    return Object.keys(Additions).includes(addition)
}

function getQuestionValue<T extends keyof Questions>(responses: PFQuestion<any>[], question: T): Questions[T] {

    let response = responses.find((it): it is PFQuestion<T> => it.custom_key === question)

    if(response) {
        return response.value
    } else {
        console.error(`IllegalArgumentError: No such key ${question}`)
        throw new Error(`IllegalArgumentError: No such key ${question}`)
    }
}

const AdditionsFormMap: { [key: string]: string } = {
    "Chicken Nuggets - $30": Additions.chickenNuggets,
    "Fairy Bread - $25": Additions.fairyBread,
    "Fruit Platter - $40": Additions.fruitPlatter,
    "Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $30": Additions.sandwichPlatter,
    "Veggie Platter - $30": Additions.veggiePlatter,
    "Vegetarian Quiches - $30": Additions.vegetarianQuiche,
    "Watermelon Platter - $20": Additions.watermelonPlatter,
    "Wedges - $25": Additions.wedges,
    "Lolly bags - $2.50 per child": Additions.lollyBags,
    "Grazing Platter for Parents (Medium: 10-15 ppl) - $98": Additions.grazingPlatterMedium,
    "Grazing Platter for Parents (Large: 15-25 ppl) - $148": Additions.grazingPlatterLarge
}