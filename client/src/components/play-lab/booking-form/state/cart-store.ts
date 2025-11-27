import type { AcuityTypes, GiftCard } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date; image?: string }

export const TERM_LENGTH = 10

interface Cart {
    // the classes curently in the cart
    selectedClasses: Record<number, LocalAcuityClass>
    // add/remove a particular class from the cart
    toggleClass: (klass: LocalAcuityClass, numberOfKids: number, isTermEnrolment: boolean) => void
    // replaces all items in the cart with these classes
    setSelectedClasses: (classes: LocalAcuityClass[], numberOfKids: number) => void
    // clears the cart
    clearCart: () => void
    discount:
        | ({
              type: 'percentage' | 'price'
              amount: number // between 0-100 for %
              description: string
          } & (
              | { isMultiSessionDiscount: true; sessionDiscountAmount: number }
              | { isMultiSessionDiscount: false; code: string }
          ))
        | null
    subtotal: number
    totalShownToCustomer: number
    total: number
    giftCard: GiftCard | null
    calculateTotal: (numberOfKids: number) => void
    applyDiscountCode: (
        discount: { discountType: 'percentage' | 'price'; discountAmount: number; code: string },
        numberOfKids: number,
        isTermEnrolment: boolean
    ) => {
        error: string | null
    }
    removeDiscount: (numberOfKids: number) => void
    applyGiftCard: (giftCard: GiftCard, numberOfKids: number) => void
    clearGiftCard: (numberOfKids: number) => void
    /**
     * Gets the date of the earliest class in the cart. Returns todays date if nothing in the cart.
     *
     * Useful for validating the child age against the actual program date.
     */
    getEarliestClassDate(): Date
}

export const useCart = create<Cart>()((set, get) => ({
    selectedClasses: {},
    discount: null,
    subtotal: 0,
    totalShownToCustomer: 0,
    total: 0,
    giftCard: null,
    toggleClass: (klass, numberOfKids) => {
        const current = get().selectedClasses
        let next: Record<number, LocalAcuityClass>
        if (current[klass.id]) {
            next = { ...current }
            delete next[klass.id]
        } else {
            next = { ...current, [klass.id]: klass }
        }
        set({ selectedClasses: next })
        get().calculateTotal(numberOfKids)
    },
    setSelectedClasses: (classes, numberOfKids) => {
        set({ selectedClasses: classes.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}) })
        get().calculateTotal(numberOfKids)
    },
    clearCart: () => {
        set({ selectedClasses: {} })
    },
    calculateTotal: (numberOfKids) => {
        const classes = Object.values(get().selectedClasses)

        const subtotal = classes.reduce((acc, curr) => acc + parseFloat(curr.price), 0) * numberOfKids

        // first check if there is an existing discount code added that isn't a multi session discount, and calculate what it would be
        const existingDiscount = get().discount
        let totalAfterDiscountCode = subtotal
        if (existingDiscount && !existingDiscount.isMultiSessionDiscount) {
            if (existingDiscount.type === 'percentage') {
                totalAfterDiscountCode = subtotal - subtotal * (existingDiscount.amount / 100)
            } else {
                totalAfterDiscountCode = subtotal - existingDiscount.amount
            }
        }

        // check multi session discount eligibility
        let sessionDiscountAmount = 0
        let description = ''
        PRICING_STRUCTURE.forEach(({ minSessions, price, discount }) => {
            if (classes.length >= minSessions) {
                description = `Multi Session Discount - $${price} / session`
                sessionDiscountAmount = discount
            }
        })

        const discountAmount = sessionDiscountAmount * classes.length * numberOfKids
        const multiSessionDiscountTotal = subtotal - discountAmount
        const multiSessionDiscount =
            discountAmount === 0
                ? null
                : ({
                      type: 'price',
                      amount: discountAmount,
                      description,
                      isMultiSessionDiscount: true,
                      sessionDiscountAmount,
                  } as const)

        // finally, apply the discount that is best
        let total = subtotal
        if (totalAfterDiscountCode < multiSessionDiscountTotal && totalAfterDiscountCode >= 0) {
            total = totalAfterDiscountCode
        } else {
            total = multiSessionDiscountTotal
            set({ discount: multiSessionDiscount })
        }

        // gift cards
        const giftCard = get().giftCard
        let totalShownToCustomer = total
        if (giftCard) {
            const balanceDollars = giftCard.balanceRemainingCents / 100

            if (total === 0) {
                set({ giftCard: null })
            } else if (total <= balanceDollars) {
                set({
                    giftCard: {
                        ...giftCard,
                        balanceAppliedCents: total * 100,
                        balanceRemainingCents: giftCard.balanceRemainingCents - total * 100,
                    },
                })
                totalShownToCustomer = 0
            } else {
                set({
                    giftCard: {
                        ...giftCard,
                        balanceAppliedCents: giftCard.balanceRemainingCents,
                        balanceRemainingCents: 0,
                    },
                })
                totalShownToCustomer -= balanceDollars
            }
        }

        set({ total, subtotal, totalShownToCustomer })
    },
    applyDiscountCode: (discount, numberOfKids) => {
        const subtotal = get().subtotal
        let newTotal = get().total
        if (discount.discountType === 'percentage') {
            newTotal = subtotal - (subtotal * discount.discountAmount) / 100
        } else if (discount.discountType === 'price') {
            newTotal = subtotal - discount.discountAmount
        }

        // first check if discount is worse than the multi session discount
        const existingDiscount = get().discount
        if (existingDiscount && existingDiscount.isMultiSessionDiscount && get().total <= newTotal) {
            const discountString = `${discount.discountType === 'price' ? '$' : ''}${discount.discountAmount}${discount.discountType === 'percentage' ? '%' : ''}`
            return {
                error: `The discount code '${discount.code}' (${discountString}) is less than the already applied 'multi session discount'. Discounts cannot be combined.`,
            }
        }

        // next make sure the discount code is not too large (discount codes dont currently support partial use)
        if (discount.discountType === 'price' && discount.discountAmount > subtotal) {
            return {
                error: `The discount code '${discount.code}' ($${discount.discountAmount}) is greater than the total. Try adding more sessions to your cart.`,
            }
        }

        // otherwise apply the discount and recalulate the cart
        set({
            discount: {
                type: discount.discountType,
                amount: discount.discountAmount,
                description: `Discount code '${discount.code}'`,
                isMultiSessionDiscount: false,
                code: discount.code,
            },
        })
        get().calculateTotal(numberOfKids)

        return { error: null }
    },
    removeDiscount: (numberOfKids) => {
        set({ discount: null })
        get().calculateTotal(numberOfKids)
    },
    applyGiftCard: (giftCard, numberOfKids) => {
        set({ giftCard })
        get().calculateTotal(numberOfKids)
    },
    clearGiftCard: (numberOfKids) => {
        set({ giftCard: null })
        get().calculateTotal(numberOfKids)
    },
    getEarliestClassDate: () => {
        const sorted = Object.values(get().selectedClasses).sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )
        if (sorted.length > 0) {
            return new Date(sorted[0].time)
        }

        return new Date()
    },
}))

export const PRICING_STRUCTURE = [
    {
        minSessions: 1,
        price: 26,
        discount: 0,
    },
    {
        minSessions: 2,
        price: 22,
        discount: 4,
    },
    {
        minSessions: 5,
        price: 20,
        discount: 6,
    },
]
