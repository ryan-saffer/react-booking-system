import type { AcuityTypes, DiscountCode, LocationOrTest } from 'fizz-kidz'
import { create } from 'zustand'

type Class = AcuityTypes.Client.Class

type Cart = {
    selectedStudio: LocationOrTest | null
    selectedClasses: Record<number, Class>
    subtotal: number
    total: number
    discount: DiscountCode | null // only for discount codes, not multi session discounts
    setSelectedStudio: (location: LocationOrTest) => void
    clearCart: () => void
    applyDiscount: (discount: DiscountCode, numberOfKids: number) => void
    clearDiscount: (numberOfKids: number) => void
    toggleClass: (klass: Class, numberOfKids: number) => void
    calculateTotal: (numberOfKids: number) => void
}

export const useCart = create<Cart>()((set, get) => ({
    selectedStudio: null,
    selectedClasses: {},
    subtotal: 0,
    total: 0,
    discount: null,
    setSelectedStudio: (location) => {
        set({ selectedStudio: location })
    },
    clearCart: () => {
        set({ selectedClasses: {} })
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

        get().calculateTotal(numberOfKids)
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
        console.log({ selectedClasses: get().selectedClasses })
        console.log({ total: get().total, subtotal: get().subtotal })
    },
}))
