import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

interface Cart {
    // the classes curently in the cart
    selectedClasses: Record<number, LocalAcuityClass>
    // add/remove a particular class from the cart
    toggleClass: (klass: LocalAcuityClass, numberOfKids: number, isTermEnrolment: boolean) => void
    // replaces all items in the cart with these classes
    setSelectedClasses: (classes: LocalAcuityClass[], numberOfKids: number) => void
    // clears the cart
    clearCart: () => void
    discount: { type: 'percentage' | 'number'; amount: number; description: string } | null // between 0-1 for percentage
    subtotal: number
    total: number
    calculateTotal: (numberOfKids: number, isTermEnrolment: boolean) => void
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
    calculateTotal: (numberOfKids: number, isTermEnrolment: boolean) => {
        const classes = Object.values(get().selectedClasses)

        const subtotal = classes.reduce((acc, curr) => acc + parseFloat(curr.price), 0) * numberOfKids

        let discountPercent = 0
        let description = ''
        if (classes.length > 0) discountPercent = 0
        if (classes.length >= 2) {
            discountPercent = 0.05
            description = 'Multi session discount - 2 or more sessions'
        }
        if (classes.length >= 4) {
            discountPercent = 0.1
            description = 'Multi session discount - 4 or more sessions'
        }
        if (classes.length >= 6 && isTermEnrolment) {
            discountPercent = 0.2
            description = 'Term enrolment discount'
        }

        const total = subtotal - subtotal * discountPercent
        const discount =
            discountPercent === 0 ? null : ({ type: 'percentage', amount: discountPercent, description } as const)

        set({ discount, subtotal, total })
    },
}))
