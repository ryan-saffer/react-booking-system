import { PFProduct, PFQuestion, Questions } from './types'
import {
    Additions,
    Booking,
    CreationDisplayValuesMap,
    Creations,
    Locations,
    AdditionsDisplayValuesMapPrices,
    AdditionsDisplayValuesMap,
} from 'fizz-kidz'
import { AdditionsFormMap } from './utils'

export class FormMapper {
    responses: PFQuestion<any>[]
    bookingId: string

    constructor(responses: PFQuestion<any>[]) {
        this.responses = responses
        this.bookingId = this.getQuestionValue('id')
    }

    mapToBooking() {
        // first get all questions shown to both in-store and mobile parties
        let booking: Partial<Booking> = {
            ...this.getSharedQuestions(),
        }

        // in-store parties use a multiple choice, while mobile use a dropdown
        booking['numberOfChildren'] =
            booking.location === 'mobile'
                ? this.getQuestionValue('number_of_children_mobile')
                : this.getQuestionValue('number_of_children_in_store')

        // additions are only asked to in-store
        if (booking.location !== 'mobile') {
            booking = {
                ...booking,
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
        const additionKeys = this.getQuestionValue('additions')
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

        const partyPackKeys = this.mapProductToSku(this.getQuestionValue('party_packs'))
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
            ...this.mapProductToSku(this.getQuestionValue('glam_creations')),
            ...this.mapProductToSku(this.getQuestionValue('science_creations')),
            ...this.mapProductToSku(this.getQuestionValue('slime_creations')),
            ...this.mapProductToSku(this.getQuestionValue('safari_creations')),
            ...this.mapProductToSku(this.getQuestionValue('unicorn_creations')),
            ...this.mapProductToSku(this.getQuestionValue('tie_dye_creations')),
            ...this.mapProductToSku(this.getQuestionValue('expert_creations')),
        ]

        // filter out any duplicate creation selections
        const filteredSkus = [...new Set(creationSkus)]

        const creations = filteredSkus.map((creation) => {
            if (this.isValidCreation(creation)) {
                return creation
            } else {
                console.log(`invalid creation SKU found: ${creation}`)
                throw new Error(`invalid creation SKU found: ${creation}`)
            }
        })

        return creations
    }

    /**
     * Return a booking object with all values from questions
     * shared across both in-store and mobile
     */
    private getSharedQuestions() {
        const creations = this.getCreations()

        const booking: Partial<Booking> = {
            location: this.mapLocation(this.getQuestionValue('location')),
            parentFirstName: this.getQuestionValue('parent_first_name'),
            parentLastName: this.getQuestionValue('parent_last_name'),
            childName: this.getQuestionValue('child_name'),
            childAge: this.getQuestionValue('child_age'),
            creation1: creations.length > 0 ? creations[0] : undefined,
            creation2: creations.length > 1 ? creations[1] : undefined,
            creation3: creations.length > 2 ? creations[2] : undefined,
            funFacts: this.getQuestionValue('fun_facts'),
            questions: this.getQuestionValue('questions'),
            ...this.getPartyPacks(),
        }

        return booking
    }

    private getQuestionValue<T extends keyof Questions>(question: T): Questions[T] {
        const response = this.responses.find((it): it is PFQuestion<T> => it.custom_key === question)

        if (response) {
            return response.value
        } else {
            console.log(`IllegalArgumentError: No such key ${question}`)
            throw new Error(`IllegalArgumentError: No such key ${question}`)
        }
    }

    private mapLocation(location: string) {
        if (this.isValidLocation(location)) {
            return location
        } else {
            console.log(`Form included invalid location: ${location}`)
            throw new Error(`Form included invalid location: ${location}`)
        }
    }

    private isValidLocation(location: string): location is Locations {
        return (<any>Object).values(Locations).includes(location)
    }

    private mapProductToSku = (products: PFProduct[]) =>
        products.map((it) => {
            return it.SKU.includes('_') ? it.SKU.substring(0, it.SKU.indexOf('_')) : it.SKU
        })

    private isValidCreation(creation: string): creation is Creations {
        return Object.keys(Creations).includes(creation)
    }

    private getAdditions() {
        const additions = this.getQuestionValue('additions')
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
        this.mapProductToSku(this.getQuestionValue('party_packs')).forEach((pack) => {
            if (this.isValidAddition(pack)) {
                booking[pack] = true
            }
        })
        return booking
    }
}
