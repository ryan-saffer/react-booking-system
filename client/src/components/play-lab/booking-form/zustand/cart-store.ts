import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date; image?: string }

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
          } & ({ isMultiSessionDiscount: true } | { isMultiSessionDiscount: false; code: string }))
        | null
    subtotal: number
    total: number
    calculateTotal: (numberOfKids: number, isTermEnrolment: boolean) => void
    applyDiscountCode: (
        discount: { discountType: 'percentage' | 'price'; discountAmount: number; code: string },
        numberOfKids: number,
        isTermEnrolment: boolean
    ) => {
        error: string | null
    }
    removeDiscount: (numberOfKids: number, isTermEnrolment: boolean) => void
}

export const useCartStore = create<Cart>()((set, get) => ({
    selectedClasses: {},
    discount: null,
    subtotal: 0,
    total: 0,
    toggleClass: (klass, numberOfKids, isTermEnrolment) => {
        const current = get().selectedClasses
        let next: Record<number, LocalAcuityClass>
        if (current[klass.id]) {
            next = { ...current }
            delete next[klass.id]
        } else {
            next = { ...current, [klass.id]: klass }
        }
        set({ selectedClasses: next })
        get().calculateTotal(numberOfKids, isTermEnrolment)
    },
    setSelectedClasses: (classes, numberOfKids) => {
        set({ selectedClasses: classes.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}) })
        get().calculateTotal(numberOfKids, true) // true since only set all classes at once for a term selection
    },
    clearCart: () => {
        set({ selectedClasses: {} })
    },
    calculateTotal: (numberOfKids, isTermEnrolment) => {
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
        let discountPercent = 0
        let description = ''
        if (classes.length > 0) discountPercent = 0
        if (classes.length >= 2) {
            discountPercent = 5
            description = 'Multi session discount - 2 or more sessions'
        }
        if (classes.length >= 4) {
            discountPercent = 10
            description = 'Multi session discount - 4 or more sessions'
        }
        if (classes.length >= 6 && isTermEnrolment) {
            discountPercent = 20
            description = 'Term enrolment discount'
        }

        const multiSessionDiscountTotal = subtotal - subtotal * (discountPercent / 100)
        const multiSessionDiscount =
            discountPercent === 0
                ? null
                : ({ type: 'percentage', amount: discountPercent, description, isMultiSessionDiscount: true } as const)

        // finally, apply the discount that is best
        if (totalAfterDiscountCode < multiSessionDiscountTotal && totalAfterDiscountCode >= 0) {
            set({ total: totalAfterDiscountCode, subtotal })
        } else {
            set({ discount: multiSessionDiscount, subtotal, total: multiSessionDiscountTotal })
        }
    },
    applyDiscountCode: (discount, numberOfKids, isTermEnrolment) => {
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
        get().calculateTotal(numberOfKids, isTermEnrolment)

        return { error: null }
    },
    removeDiscount: (numberOfKids, isTermEnrolment) => {
        set({ discount: null })
        get().calculateTotal(numberOfKids, isTermEnrolment)
    },
}))
