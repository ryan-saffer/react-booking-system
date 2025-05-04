import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

interface Cart {
    selectedClasses: Record<number, LocalAcuityClass>
    toggleClass: (klass: LocalAcuityClass) => void
    discount: { type: 'percentage' | 'number'; amount: number } | null // between 0-1 for percentage
    subtotal: number
    total: number
}

export const useCartStore = create<Cart>()((set, get) => ({
    selectedClasses: {},
    toggleClass: (klass) => {
        const selectedClasses = get().selectedClasses
        if (selectedClasses[klass.id]) {
            delete selectedClasses[klass.id]
            const { discount, subtotal, total } = calculateTotal(Object.values(selectedClasses))
            set({ selectedClasses, discount, subtotal, total })
        } else {
            const newClasses = { ...selectedClasses, [klass.id]: klass }
            const { discount, subtotal, total } = calculateTotal(Object.values(newClasses))
            set({ selectedClasses: newClasses, discount, subtotal, total })
        }
    },
    discount: null,
    subtotal: 0,
    total: 0,
}))

function calculateTotal(classes: LocalAcuityClass[]): Pick<Cart, 'discount' | 'subtotal' | 'total'> {
    const subtotal = classes.reduce((acc, curr) => acc + parseFloat(curr.price), 0)
    let discountPercent = 0
    if (classes.length < 2) discountPercent = 0
    else if (classes.length < 4) discountPercent = 0.1
    else if (classes.length < 8) discountPercent = 0.15
    else if (classes.length >= 8) discountPercent = 0.2

    const total = subtotal - subtotal * discountPercent

    const discount = discountPercent === 0 ? null : ({ type: 'percentage', amount: discountPercent } as const)

    return { discount, subtotal, total }
}
