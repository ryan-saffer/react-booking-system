import type { Metadata, Acuity } from 'fizz-kidz'

/**
 * A class for calculating holiday program refunds
 */
export class RefundCalculator {
    metadata: Metadata
    amountCharged: number

    /**
     *
     * @param metadata the metadata from the stripe payment intent
     * @param amountCharged the amount charged for the appointment. Comes from the acuity appointment itself.
     */
    constructor(metadata: Metadata, amountCharged: number) {
        this.metadata = metadata
        this.amountCharged = amountCharged
    }

    /**
     * Calculates how much should be refunded based on the discount.
     * If no discount exists, return the amount paid.
     * If a discount exists, and it is a percentage discount, return the amount * (1 - discount amount)
     * Price discounts are only applied if its the final program (ie programCount === 1)
     *
     * @returns the amount to refund
     */
    calculateRefund() {
        console.log('discount:', this.metadata.discount)
        console.log(this.metadata.discount === '')
        console.log('amount charged', this.amountCharged)
        // check if there are any discounts.
        if (this.metadata.discount === '' || this.metadata.discount === 'null') {
            // sometimes 'null' is stored into stripe
            // just refund the amount charged
            return this.amountCharged
        } else {
            const discount = JSON.parse(this.metadata.discount) as Acuity.Certificate
            switch (discount.discountType) {
                case 'percentage':
                    return this.amountCharged * (1 - discount.discountAmount / 100)
                case 'price':
                    // only refund price discounts if its the last booking
                    if (this.metadata.programCount === '1') {
                        return this.amountCharged - discount.discountAmount
                    } else {
                        return this.amountCharged
                    }
            }
        }
    }
}
