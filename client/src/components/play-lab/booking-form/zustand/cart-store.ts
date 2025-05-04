import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

interface Cart {
    selectedClasses: Record<number, LocalAcuityClass>
    discount: { type: 'percentage' | 'number'; amount: number } | null // between 0-1 for percentage
    subtotal: number
    total: number
    toggleClass: (klass: LocalAcuityClass, numberOfKids: number) => void
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
    calculateTotal: (numberOfKids: number) => {
        const selectedClasses = get().selectedClasses
        const { discount, subtotal, total } = calculateTotal(Object.values(selectedClasses), numberOfKids)
        set({ discount, subtotal, total })
    },
}))

function calculateTotal(
    classes: LocalAcuityClass[],
    numberOfKids: number
): Pick<Cart, 'discount' | 'subtotal' | 'total'> {
    const subtotal = classes.reduce((acc, curr) => acc + parseFloat(curr.price), 0) * numberOfKids

    let discountPercent = 0
    if (classes.length < 2) discountPercent = 0
    else if (classes.length < 4) discountPercent = 0.1
    else if (classes.length < 8) discountPercent = 0.15
    else if (classes.length >= 8) discountPercent = 0.2

    const total = subtotal - subtotal * discountPercent

    const discount = discountPercent === 0 ? null : ({ type: 'percentage', amount: discountPercent } as const)

    return { discount, subtotal, total }
}
