import { create } from 'zustand'

import type { AcuityTypes, DiscountCode, GiftCard } from '@fizz-kidz/core'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

export const FULL_TERM_DISCOUNT_PERCENTAGE = 20

type Cart = {
    selectedClasses: Record<number, LocalAcuityClass>
    fullTermClassIds: Record<number, true>
    childCount: number
    subtotal: number
    fullTermDiscount: number
    discountCode: (DiscountCode & { description: string }) | null
    discountCodeAmount: number
    total: number
    totalCents: number
    totalShownToCustomer: number
    totalShownToCustomerCents: number
    giftCard: GiftCard | null
    toggleClass: (klass: LocalAcuityClass, groupClasses?: LocalAcuityClass[]) => void
    selectEntireTermGroup: (classes: LocalAcuityClass[]) => void
    setChildCount: (childCount: number) => void
    applyDiscountCode: (discountCode: DiscountCode) => { error: string | null }
    clearDiscountCode: () => void
    applyGiftCard: (giftCard: GiftCard) => void
    clearGiftCard: () => void
    clearCart: () => void
}

export const useCart = create<Cart>()((set, get) => ({
    selectedClasses: {},
    fullTermClassIds: {},
    childCount: 1,
    subtotal: 0,
    fullTermDiscount: 0,
    discountCode: null,
    discountCodeAmount: 0,
    total: 0,
    totalCents: 0,
    totalShownToCustomer: 0,
    totalShownToCustomerCents: 0,
    giftCard: null,
    toggleClass: (klass, groupClasses = []) => {
        const selectedClasses = { ...get().selectedClasses }
        const fullTermClassIds = { ...get().fullTermClassIds }
        const availableGroupClasses = groupClasses.filter((groupClass) => groupClass.slotsAvailable > 0)

        if (selectedClasses[klass.id]) {
            delete selectedClasses[klass.id]
            if (fullTermClassIds[klass.id]) {
                if (availableGroupClasses.length > 0) {
                    availableGroupClasses.forEach((groupClass) => {
                        delete fullTermClassIds[groupClass.id]
                    })
                } else {
                    delete fullTermClassIds[klass.id]
                }
            } else {
                delete fullTermClassIds[klass.id]
            }
        } else {
            selectedClasses[klass.id] = klass
            if (
                availableGroupClasses.length > 0 &&
                availableGroupClasses.every((groupClass) => selectedClasses[groupClass.id])
            ) {
                availableGroupClasses.forEach((groupClass) => {
                    fullTermClassIds[groupClass.id] = true
                })
            }
        }

        set({ selectedClasses, fullTermClassIds })
        recalculateTotals()
    },
    selectEntireTermGroup: (classes) => {
        const selectedClasses = { ...get().selectedClasses }
        const fullTermClassIds = { ...get().fullTermClassIds }

        classes
            .filter((klass) => klass.slotsAvailable > 0)
            .forEach((klass) => {
                selectedClasses[klass.id] = klass
                fullTermClassIds[klass.id] = true
            })

        set({ selectedClasses, fullTermClassIds })
        recalculateTotals()
    },
    setChildCount: (childCount) => {
        set({ childCount })
        recalculateTotals()
    },
    applyDiscountCode: (discountCode) => {
        const discountableTotalCents = Math.round((get().subtotal - get().fullTermDiscount) * 100)
        const discountAmountCents = Math.round(discountCode.discountAmount * 100)

        if (discountCode.discountType === 'price' && discountAmountCents > discountableTotalCents) {
            return {
                error: `The discount code '${discountCode.code}' ($${discountCode.discountAmount}) is greater than the total. Try adding more sessions to your cart.`,
            }
        }

        set({
            discountCode: {
                ...discountCode,
                description: `Discount code '${discountCode.code}'`,
            },
        })
        recalculateTotals()

        return { error: null }
    },
    clearDiscountCode: () => {
        set({ discountCode: null })
        recalculateTotals()
    },
    applyGiftCard: (giftCard) => {
        set({ giftCard })
        recalculateTotals()
    },
    clearGiftCard: () => {
        set({ giftCard: null })
        recalculateTotals()
    },
    clearCart: () => {
        set({
            selectedClasses: {},
            fullTermClassIds: {},
            subtotal: 0,
            fullTermDiscount: 0,
            discountCode: null,
            discountCodeAmount: 0,
            total: 0,
            totalCents: 0,
            totalShownToCustomer: 0,
            totalShownToCustomerCents: 0,
            giftCard: null,
        })
    },
}))

/** Recalculates cart totals in cents using the same discount and gift-card order as Square checkout. */
function recalculateTotals() {
    const { selectedClasses, fullTermClassIds, childCount, discountCode } = useCart.getState()
    const selected = Object.values(selectedClasses)
    const selectedLineItems = selected.flatMap((klass) =>
        Array.from({ length: childCount }, () => {
            const amountCents = dollarsToCents(klass.price)
            const fullTermDiscountCents = fullTermClassIds[klass.id]
                ? squarePercentageDiscountCents(amountCents, FULL_TERM_DISCOUNT_PERCENTAGE)
                : 0

            return {
                amountCents,
                fullTermDiscountCents,
                discountableAmountCents: amountCents - fullTermDiscountCents,
            }
        })
    )
    const subtotalCents = selectedLineItems.reduce((acc, item) => acc + item.amountCents, 0)
    const fullTermDiscountCents = selectedLineItems.reduce((acc, item) => acc + item.fullTermDiscountCents, 0)
    const discountableTotalCents = subtotalCents - fullTermDiscountCents
    let discountCodeAmountCents = 0

    if (discountCode) {
        discountCodeAmountCents =
            discountCode.discountType === 'percentage'
                ? squarePercentageDiscountCents(discountableTotalCents, discountCode.discountAmount)
                : Math.round(discountCode.discountAmount * 100)

        if (discountCodeAmountCents > discountableTotalCents) {
            useCart.setState({ discountCode: null })
            discountCodeAmountCents = 0
        }
    }

    const totalCents = discountableTotalCents - discountCodeAmountCents
    const giftCard = useCart.getState().giftCard
    let totalShownToCustomerCents = totalCents

    if (giftCard) {
        if (totalCents === 0) {
            useCart.setState({ giftCard: null })
        } else if (totalCents <= giftCard.balanceRemainingCents) {
            useCart.setState({
                giftCard: {
                    ...giftCard,
                    balanceAppliedCents: totalCents,
                    balanceRemainingCents: giftCard.balanceRemainingCents - totalCents,
                },
            })
            totalShownToCustomerCents = 0
        } else {
            useCart.setState({
                giftCard: {
                    ...giftCard,
                    balanceAppliedCents: giftCard.balanceRemainingCents,
                    balanceRemainingCents: 0,
                },
            })
            totalShownToCustomerCents -= giftCard.balanceRemainingCents
        }
    }

    useCart.setState({
        subtotal: centsToDollars(subtotalCents),
        fullTermDiscount: centsToDollars(fullTermDiscountCents),
        discountCodeAmount: centsToDollars(discountCodeAmountCents),
        total: centsToDollars(totalCents),
        totalCents,
        totalShownToCustomer: centsToDollars(totalShownToCustomerCents),
        totalShownToCustomerCents,
    })
}

/** Converts an Acuity dollar price string to an integer number of cents. */
function dollarsToCents(value: string) {
    return Math.round(Number.parseFloat(value) * 100)
}

/** Converts an integer number of cents to a dollar value for display state. */
function centsToDollars(value: number) {
    return value / 100
}

/** Applies Square-compatible percentage rounding to a cent amount. */
function squarePercentageDiscountCents(amountCents: number, percentage: number) {
    return Math.round(amountCents * (percentage / 100))
}
