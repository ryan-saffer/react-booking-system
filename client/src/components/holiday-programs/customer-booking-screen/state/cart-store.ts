import { create } from 'zustand'

import type { AcuityTypes, DiscountCode, GiftCard, StudioOrTest } from 'fizz-kidz'

type Class = AcuityTypes.Client.Class

type Cart = {
    selectedStudio: StudioOrTest | null
    selectedClasses: Record<number, Class>
    /**
     * Array of classIds that are in the cart and are an 'all day' class
     */
    sameDayClasses: number[]
    subtotal: number // total before discounts
    totalShownToCustomer: number // total after discounts less gift card (amount shown to customer as owed - applying a gift card reduces this number)
    total: number // total after disconts (amount to be paid - gift cards not included since its a payment method, not a 'reduction' in the cost)
    discount: DiscountCode | null // only for discount codes, not multi session discounts
    giftCard: GiftCard | null
    setSelectedStudio: (location: StudioOrTest) => void
    clearCart: () => void
    applyDiscount: (discount: DiscountCode, numberOfKids: number) => void
    clearDiscount: (numberOfKids: number) => void
    applyGiftCard: (giftCard: GiftCard, numberOfKids: number) => void
    clearGiftCard: (numberOfKids: number) => void
    toggleClass: (klass: Class, numberOfKids: number) => void
    updateSameDayClasses: () => void
    calculateTotal: (numberOfKids: number) => void
    /**
     * Of all the classes in the cart, return the date of the earliest program. If nothing in the cart, it will return today.
     *
     * This is useful for calculating if the child is old enough to attend, since we can calculate based on their age at the time of the program.
     */
    getEarliestClass(): Date
}

export const useCart = create<Cart>()((set, get) => ({
    selectedStudio: null,
    selectedClasses: {},
    sameDayClasses: [],
    subtotal: 0,
    totalShownToCustomer: 0,
    total: 0,
    discount: null,
    giftCard: null,
    setSelectedStudio: (location) => {
        set({ selectedStudio: location })
    },
    clearCart: () => {
        set({ selectedClasses: {}, sameDayClasses: [] })
    },
    clearDiscount: (numberOfKids) => {
        set({ discount: null })
        get().calculateTotal(numberOfKids)
    },
    applyDiscount: (discount, numberOfKids) => {
        set({ discount })
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
    toggleClass: (klass, numberOfKids) => {
        const currentClasses = get().selectedClasses
        const copiedClasses = { ...currentClasses } // create a new reference object

        const isAlreadySelected = !!copiedClasses[klass.id]
        if (isAlreadySelected) {
            delete copiedClasses[klass.id]
            set({ selectedClasses: copiedClasses })
        } else {
            set({ selectedClasses: { ...copiedClasses, [klass.id]: klass } })
        }

        get().updateSameDayClasses()
        get().calculateTotal(numberOfKids)
    },
    updateSameDayClasses: () => {
        const classes = Object.values(get().selectedClasses)
        const sameDayClasses: number[] = []
        for (let i = 0; i < classes.length; i++) {
            for (let j = i + 1; j < classes.length; j++) {
                // Compare date portion only (avoid timezone shifts from Date parsing)
                const date1 = classes[i].time.split('T')[0]
                const date2 = classes[j].time.split('T')[0]
                if (date1 === date2) {
                    sameDayClasses.push(classes[i].id)
                    sameDayClasses.push(classes[j].id)
                }
            }
        }

        set({ sameDayClasses })
    },
    calculateTotal: (numberOfKids) => {
        const selectedClasses = get().selectedClasses

        const subtotal = Object.values(selectedClasses).reduce(
            (acc, curr) => acc + parseFloat(curr.price) * numberOfKids,
            0
        )

        let total = subtotal

        const discount = get().discount
        if (discount) {
            switch (discount.discountType) {
                case 'percentage':
                    total = total - total * (discount.discountAmount / 100)
                    break
                case 'price':
                    total = total - discount.discountAmount
                    break
                default: {
                    const exhaustiveCheck: never = discount.discountType
                    console.error(`Unrecognised discountType: '${exhaustiveCheck}'`)
                }
            }
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

        set({ subtotal, total, totalShownToCustomer })
    },
    getEarliestClass: () => {
        const sorted = Object.values(get().selectedClasses).sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )
        if (sorted.length > 0) {
            return new Date(sorted[0].time)
        }
        return new Date()
    },
}))
