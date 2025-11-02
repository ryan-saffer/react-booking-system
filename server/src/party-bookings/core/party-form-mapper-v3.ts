import type { Booking, Studio } from 'fizz-kidz'
import { ADDITIONS, CREATIONS, getKeyByValue, ObjectEntries, type PartyFormV3, STUDIOS } from 'fizz-kidz'
import { logger } from 'firebase-functions/v2'
import type { PaperformSubmission } from '@/paperforms/core/paperform-client'

export class PartyFormMapperV3 {
    responses: PaperformSubmission<PartyFormV3>
    bookingId: string

    constructor(responses: PaperformSubmission<PartyFormV3>) {
        this.responses = responses
        this.bookingId = this.responses.getFieldValue('id')
    }

    mapToBooking(type: Booking['type'], location: Studio) {
        // first get all questions shown to both in-store and mobile parties
        let booking = this.getSharedQuestions(type, location)

        // in-store parties use a multiple choice, while mobile use a dropdown
        booking['numberOfChildren'] =
            type === 'mobile'
                ? this.responses.getFieldValue('number_of_children_mobile')
                : this.responses.getFieldValue('number_of_children_in_store')

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
                      'demon_hunters_creations',
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
                      'demon_hunters_creations_mobile',
                  ] as const)

        const creations = creationKeys.reduce(
            (acc, curr) => [...acc, ...this.responses.getFieldValue(curr)],
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
    private getSharedQuestions(type: Booking['type'], location: Studio) {
        const creations = this.getCreations(type)

        const booking: Partial<Booking> = {
            location: type === 'studio' ? this.mapLocation(this.responses.getFieldValue('location')) : location, // mobile party forms have 'location=mobile', so this fixes it
            parentFirstName: this.responses.getFieldValue('parent_first_name'),
            parentLastName: this.responses.getFieldValue('parent_last_name'),
            childName: this.responses.getFieldValue('child_name'),
            childAge: this.responses.getFieldValue('child_age'),
            creation1: creations.length > 0 ? creations[0] : undefined,
            creation2: creations.length > 1 ? creations[1] : undefined,
            creation3: creations.length > 2 ? creations[2] : undefined,
            funFacts: this.responses.getFieldValue('fun_facts'),
            questions: this.responses.getFieldValue('questions'),
            takeHomeBags: this.responses
                .getFieldValue('take_home_bags')
                .reduce((acc, { SKU, quantity }) => ({ ...acc, [SKU]: quantity }), {}),
            products: this.responses
                .getFieldValue('products')
                .reduce((acc, { SKU, quantity }) => ({ ...acc, [SKU]: quantity }), {}),
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

    private isValidLocation(studio: string): studio is Studio {
        return STUDIOS.includes(studio as any)
    }

    private getFoodPackage() {
        // paperform limits this question to only one option allowed, and questions is required,
        // so just get the first item.
        const value = this.responses.getFieldValue('food_package')
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
        const formValues = this.responses.getFieldValue('additions')
        const additions = formValues.map((formValue) => {
            const addition = ObjectEntries(ADDITIONS).find(
                ([, additionKey]) => formValue === additionKey.displayValueWithPrice
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
        this.#mapAdditionFormValuesToAdditionKeys().forEach((addition) => {
            booking[addition] = true
        })

        return booking
    }

    getCake(): Booking['cake'] {
        const cake = this.responses.getFieldValue('cake')
        if (cake !== 'I will bring my own cake') {
            const cakeFlavours = this.responses.getFieldValue('cake_flavours')
            const cakeMessage = this.responses.getFieldValue('cake_message')

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
        const size = this.responses.getFieldValue('cake_size')
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
        const served = this.responses.getFieldValue('cake_served')
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
        const cakeCandles = this.responses.getFieldValue('cake_candles')
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
}
