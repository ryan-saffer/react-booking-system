import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

interface Cart {
    // the classes curently in the cart
    selectedClasses: Record<number, LocalAcuityClass>
    // add/remove a particular class from the cart
    toggleClass: (klass: LocalAcuityClass, numberOfKids: number) => void
    // replaces all items in the cart with these classes
    setSelectedClasses: (classes: LocalAcuityClass[], numberOfKids: number) => void
    // clears the cart
    clearCart: () => void
    discount: { type: 'percentage' | 'number'; amount: number; description: string } | null // between 0-1 for percentage
    subtotal: number
    total: number
    calculateTotal: (numberOfKids: number) => void
}

export const useCartStore = create<Cart>()((set, get) => ({
    selectedClasses: {},
    discount: null,
    subtotal: 0,
    total: 0,
    toggleClass: (klass, numberOfKids) => {
        const selectedClasses = get().selectedClasses
        if (selectedClasses[klass.id]) {
            delete selectedClasses[klass.id]
            set({ selectedClasses })
            get().calculateTotal(numberOfKids)
        } else {
            set({ selectedClasses: { ...selectedClasses, [klass.id]: klass } })
            get().calculateTotal(numberOfKids)
        }
    },
    setSelectedClasses: (classes, numberOfKids) => {
        set({ selectedClasses: classes.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}) })
        get().calculateTotal(numberOfKids)
    },
    clearCart: () => {
        set({ selectedClasses: {} })
    },
    calculateTotal: (numberOfKids: number) => {
        const classes = Object.values(get().selectedClasses)

        const subtotal = classes.reduce((acc, curr) => acc + parseFloat(curr.price), 0) * numberOfKids

        let discountPercent = 0
        let description = ''
        if (classes.length < 2) discountPercent = 0
        else if (classes.length < 4) {
            discountPercent = 0.05
            description = 'Multi session discount - 2 or more sessions'
        } else if (classes.length < 6) {
            discountPercent = 0.1
            description = 'Multi session discount - 4 or more sessions'
        } else if (classes.length >= 6) {
            discountPercent = 0.2
            description = 'Multi session discount - 6 or more sessions'
        }

        const total = subtotal - subtotal * discountPercent
        const discount =
            discountPercent === 0 ? null : ({ type: 'percentage', amount: discountPercent, description } as const)

        set({ discount, subtotal, total })
    },
}))
