import type { AcuityTypes, DiscountCode, LocationOrTest } from 'fizz-kidz'
import { create } from 'zustand'

type Class = AcuityTypes.Client.Class

type Cart = {
    selectedStudio: LocationOrTest | null
    selectedClasses: Record<number, Class>
    /**
     * Array of classIds that are in the cart and are an 'all day' class
     */
    sameDayClasses: number[]
    subtotal: number
    total: number
    discount: DiscountCode | null // only for discount codes, not multi session discounts
    setSelectedStudio: (location: LocationOrTest) => void
    clearCart: () => void
    applyDiscount: (discount: DiscountCode, numberOfKids: number) => void
    clearDiscount: (numberOfKids: number) => void
    toggleClass: (klass: Class, numberOfKids: number) => void
    updateSameDayClasses: () => void
    calculateTotal: (numberOfKids: number) => void
}

export const useCart = create<Cart>()((set, get) => ({
    selectedStudio: null,
    selectedClasses: {},
    sameDayClasses: [],
    subtotal: 0,
    total: 0,
    discount: null,
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
                const date1 = new Date(classes[i].time)
                const date2 = new Date(classes[j].time)
                if (date1.getDate() === date2.getDate()) {
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
            (acc, curr) => acc + parseInt(curr.price) * numberOfKids,
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

        set({ subtotal, total })
    },
}))
