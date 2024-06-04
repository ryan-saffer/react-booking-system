import {
    Additions,
    AdditionsDisplayValuesMap,
    AdditionsDisplayValuesMapPrices,
    Booking,
    CreationDisplayValuesMap,
    Creations,
    getQuestionValue,
    Location,
    PaperFormResponse,
    PartyFormV2,
    PFProduct,
} from 'fizz-kidz'
import { AdditionsFormMap } from './utils.party'
import { logger } from 'firebase-functions/v2'

export class PartyFormMapperV2 {
    responses: PaperFormResponse<PartyFormV2>
    bookingId: string

    constructor(responses: PaperFormResponse<PartyFormV2>) {
        this.responses = responses
        this.bookingId = getQuestionValue(this.responses, 'id')
    }

    mapToBooking(type: Booking['type'], location: Location) {
        // first get all questions shown to both in-store and mobile parties
        let booking = this.getSharedQuestions(type, location)

        // in-store parties use a multiple choice, while mobile use a dropdown
        booking['numberOfChildren'] =
            type === 'mobile'
                ? getQuestionValue(this.responses, 'number_of_children_mobile')
                : getQuestionValue(this.responses, 'number_of_children_in_store')

        // additions are only asked to in-store parties
        if (type !== 'mobile') {
            booking = {
                ...booking,
                ...this.getFoodPackage(),
                ...this.getAdditions(),
            }
        }

        return booking
    }

    getCreationDisplayValues() {
        const creationKeys = this.getCreations()
        const creations: string[] = []
        creationKeys.forEach((creation) => {
            creations.push(CreationDisplayValuesMap[creation])
        })
        return creations
    }

    getAdditionDisplayValues(showPrices: boolean) {
        const additionKeys = getQuestionValue(this.responses, 'additions')
        const displayValues: string[] = []
        additionKeys.forEach((addition) => {
            if (this.isValidAddition(addition)) {
                if (showPrices) {
                    displayValues.push(AdditionsDisplayValuesMapPrices[addition])
                } else {
                    displayValues.push(AdditionsDisplayValuesMap[addition])
                }
            }
        })

        const partyPackKeys = this.mapProductToSku(getQuestionValue(this.responses, 'party_packs'))
        partyPackKeys.forEach((pack) => {
            if (this.isValidAddition(pack)) {
                displayValues.push(AdditionsDisplayValuesMapPrices[pack])
            }
        })
        return displayValues
    }

    /**
     * Returns an array of SKUs for all selected creations.
     */
    private getCreations() {
        const creationSkus = [
            ...this.mapProductToSku(getQuestionValue(this.responses, 'glam_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'science_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'slime_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'safari_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'unicorn_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'tie_dye_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'taylor_swift_creations')),
            ...this.mapProductToSku(getQuestionValue(this.responses, 'expert_creations')),
        ]

        // filter out any duplicate creation selections
        const filteredSkus = [...new Set(creationSkus)]

        return filteredSkus.map((creation) => {
            if (this.isValidCreation(creation)) {
                return creation
            } else {
                logger.log(`invalid creation SKU found: ${creation}`)
                throw new Error(`invalid creation SKU found: ${creation}`)
            }
        })
    }

    /**
     * Return a booking object with all values from questions
     * shared across both in-store and mobile
     */
    private getSharedQuestions(type: Booking['type'], location: Location) {
        const creations = this.getCreations()

        const booking: Partial<Booking> = {
            location: type === 'studio' ? this.mapLocation(getQuestionValue(this.responses, 'location')) : location, // mobile party forms have 'location=mobile', so this fixes it
            parentFirstName: getQuestionValue(this.responses, 'parent_first_name'),
            parentLastName: getQuestionValue(this.responses, 'parent_last_name'),
            childName: getQuestionValue(this.responses, 'child_name'),
            childAge: getQuestionValue(this.responses, 'child_age'),
            creation1: creations.length > 0 ? creations[0] : undefined,
            creation2: creations.length > 1 ? creations[1] : undefined,
            creation3: creations.length > 2 ? creations[2] : undefined,
            funFacts: getQuestionValue(this.responses, 'fun_facts'),
            questions: getQuestionValue(this.responses, 'questions'),
            ...this.getPartyPacks(),
        }

        return booking
    }

    private mapLocation(location: string) {
        if (this.isValidLocation(location)) {
            return location
        } else {
            logger.log(`Form included invalid location: ${location}`)
            throw new Error(`Form included invalid location: ${location}`)
        }
    }

    private isValidLocation(location: string): location is Location {
        return (<any>Object).values(Location).includes(location)
    }

    private mapProductToSku = (products: PFProduct[]) =>
        products.map((it) => (it.SKU.includes('_') ? it.SKU.substring(0, it.SKU.indexOf('_')) : it.SKU))

    private isValidCreation(creation: string): creation is Creations {
        return Object.keys(Creations).includes(creation)
    }

    private getFoodPackage() {
        // paperform limits this question to only one option allowed, and questions is required,
        // so just get the first item.
        const value = getQuestionValue(this.responses, 'food_package')
        if (value === 'include_food_package') {
            return { includesFood: true }
        }
        if (value === 'dont_include_food_package') {
            return { includesFood: false }
        }

        throw new Error(`Invalid response found for food package question: '${value}'`)
    }

    private getAdditions() {
        const additions = getQuestionValue(this.responses, 'additions')
        additions.forEach((addition, index, array) => (array[index] = AdditionsFormMap[addition]))
        const booking: Partial<Booking> = {}
        additions.forEach((addition) => {
            if (this.isValidAddition(addition)) {
                booking[addition] = true
            }
        })

        return booking
    }

    private isValidAddition(addition: string): addition is Additions {
        return Object.keys(Additions).includes(addition)
    }

    private getPartyPacks() {
        const booking: Partial<Booking> = {}
        this.mapProductToSku(getQuestionValue(this.responses, 'party_packs')).forEach((pack) => {
            if (this.isValidAddition(pack)) {
                booking[pack] = true
            }
        })
        return booking
    }
}
