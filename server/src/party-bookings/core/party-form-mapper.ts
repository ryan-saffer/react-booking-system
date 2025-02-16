import {
    ADDITIONS,
    Booking,
    CREATIONS,
    getKeyByValue,
    getQuestionValue,
    Location,
    ObjectEntries,
    PaperFormResponse,
    PartyForm,
} from 'fizz-kidz'
import { logger } from 'firebase-functions/v2'

export class PartyFormMapper {
    responses: PaperFormResponse<PartyForm>
    bookingId: string

    constructor(responses: PaperFormResponse<PartyForm>) {
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
                ...this.#getAdditionsAsPartialBooking(),
                cake: this.getCake(),
            }
        }

        return booking
    }

    getCreationDisplayValues(type: Booking['type']) {
        const creationKeys = this.getCreations(type)
        const creations: string[] = []
        creationKeys.forEach((creation) => {
            creations.push(CREATIONS[creation])
        })
        return creations
    }

    getAdditionDisplayValues(showPrices: boolean) {
        const additions = this.#mapAdditionFormValuesToAdditionKeys()
        const displayValues: string[] = []
        for (const addition of additions) {
            displayValues.push(
                showPrices ? ADDITIONS[addition].displayValueWithPrice : ADDITIONS[addition].displayValue
            )
        }

        // TODO: Add back once new party packs are ready to go
        // const partyPackKeys = this.mapProductToSku(getQuestionValue(this.responses, 'party_packs'))
        // partyPackKeys.forEach((pack) => {
        //     if (this.isValidAddition(pack)) {
        //         displayValues.push(AdditionsDisplayValuesMapPrices[pack])
        //     }
        // })
        return displayValues
    }

    /**
     * Returns an array of SKUs for all selected creations.
     */
    private getCreations(type: Booking['type']) {
        /**
         * Currently creations are separated in PaperForms. This is for the case that a creation
         * is offered only in-studio. To remove it as an option, just remove it from the '_mobile' version in Paperform and done.
         * It means maintaining PaperForm is a bit more effort... but worth it for these cases.
         */
        const creationKeys =
            type === 'studio'
                ? ([
                      'glam_creations',
                      'science_creations',
                      'slime_creations',
                      'fairy_creations',
                      'fluid_bear_creations',
                      'safari_creations',
                      'unicorn_creations',
                      'tie_dye_creations',
                      'taylor_swift_creations',
                  ] as const)
                : ([
                      'glam_creations_mobile',
                      'science_creations_mobile',
                      'slime_creations_mobile',
                      'fairy_creations_mobile',
                      'fluid_bear_creations_mobile',
                      'safari_creations_mobile',
                      'unicorn_creations_mobile',
                      'tie_dye_creations_mobile',
                      'taylor_swift_creations_mobile',
                  ] as const)

        const creations = creationKeys.reduce(
            (acc, curr) => [...acc, ...getQuestionValue(this.responses, curr)],
            [] as string[]
        )

        const creationSkus = creations.map((creation) => {
            const creationSku = getKeyByValue(CREATIONS, creation)
            if (creationSku) {
                return creationSku
            } else {
                logger.log(`Invalid creation form value found: '${creation}'`)
                throw new Error(`Invalid creation form value found: '${creation}'`)
            }
        })

        // filter out any duplicate creation selections
        const uniqueSkus = [...new Set(creationSkus)]

        return uniqueSkus
    }

    /**
     * Return a booking object with all values from questions
     * shared across both in-store and mobile
     */
    private getSharedQuestions(type: Booking['type'], location: Location) {
        const creations = this.getCreations(type)

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
            // TODO: add back when new party packs are ready to go
            // ...this.getPartyPacks(),
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

    private getFoodPackage() {
        // paperform limits this question to only one option allowed, and questions is required,
        // so just get the first item.
        const value = getQuestionValue(this.responses, 'food_package')
        if (value === 'Include the food package') {
            return { includesFood: true }
        }
        if (value === 'I will self-cater the party') {
            return { includesFood: false }
        }

        throw new Error(`Invalid response found for food package question: '${value}'`)
    }

    /**
     * Paperform just returns the additional food options as string matching their display value on the form.
     * This will lookup each addition and return the key, or throw an error if it can't find one.
     */
    #mapAdditionFormValuesToAdditionKeys() {
        const formValues = getQuestionValue(this.responses, 'additions')
        const additions = formValues.map((formValue) => {
            const addition = ObjectEntries(ADDITIONS).find(
                ([, additionKey]) => additionKey.displayValueWithPrice === formValue
            )?.[0]
            if (!addition) {
                throw new Error(`Could not find addition that matches chosen form value of '${formValue}'`)
            }
            return addition
        })

        return additions
    }

    #getAdditionsAsPartialBooking() {
        const booking: Partial<Booking> = {}
        const additions = this.#mapAdditionFormValuesToAdditionKeys()
        additions.forEach((addition) => {
            booking[addition] = true
        })

        return booking
    }

    getCake(): Booking['cake'] {
        const cake = getQuestionValue(this.responses, 'cake')
        if (cake !== 'I will bring my own cake') {
            const cakeFlavours = getQuestionValue(this.responses, 'cake_flavours')
            const cakeMessage = getQuestionValue(this.responses, 'cake_message')

            return {
                selection: cake,
                flavours: cakeFlavours,
                served: this.getCakeServed(),
                candles: this.getCakeCandles(),
                size: this.getCakeSize(),
                ...(cakeMessage && { message: cakeMessage }),
            }
        } else {
            return
        }
    }

    // using this function assumes they have selected a cake
    private getCakeSize() {
        const size = getQuestionValue(this.responses, 'cake_size')
        switch (size) {
            case 'small_cake':
                return 'Small (12-15 serves)'
            case 'medium_cake':
                return 'Medium (20-25 serves)'
            case 'large_cake':
                return 'Large (30-35 serves)'
            default: {
                const exhaustiveCheck: never = size
                throw new Error(`Unhandled cake size in getCakeSize(): '${exhaustiveCheck}'`)
            }
        }
    }

    private getCakeServed() {
        const served = getQuestionValue(this.responses, 'cake_served')
        switch (served) {
            case 'cup':
                return 'Ice-cream cup with spoon'
            case 'waffle_cones':
                return 'Waffle Cones'
            case 'bring_own_bowls':
                return 'Bring my own serving of bowls/cones'
            default: {
                const exhaustiveCheck: never = served
                throw new Error(`Unhandled cake served in getCakeServed(): '${exhaustiveCheck}'`)
            }
        }
    }

    private getCakeCandles() {
        const cakeCandles = getQuestionValue(this.responses, 'cake_candles')
        switch (cakeCandles) {
            case 'include_candles':
                return 'Include candles'
            case 'bring_own_candles':
                return 'Bring my own candles'
            default: {
                const exhaustiveCheck: never = cakeCandles
                throw new Error(`Unhandled cake candles in getCakeCandles(): '${exhaustiveCheck}'`)
            }
        }
    }

    // TODO: add back when new party packs are ready
    // private getPartyPacks() {
    //     const booking: Partial<Booking> = {}
    //     this.mapProductToSku(getQuestionValue(this.responses, 'party_packs')).forEach((pack) => {
    //         if (this.isValidAddition(pack)) {
    //             booking[pack] = true
    //         }
    //     })
    //     return booking
    // }
}
