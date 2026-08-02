import { beforeEach, describe, expect, it } from 'vite-plus/test'

import { FULL_TERM_DISCOUNT_PERCENTAGE, type LocalAcuityClass, useCart } from './cart-store'

const resetStore = () =>
    useCart.setState({
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
    })

const makeClass = (overrides: Partial<LocalAcuityClass> & { id: number; time: Date }): LocalAcuityClass => ({
    id: overrides.id,
    title: overrides.title ?? `Class ${overrides.id}`,
    calendarID: overrides.calendarID ?? 1,
    calendar: overrides.calendar ?? 'Balwyn',
    slotsAvailable: overrides.slotsAvailable ?? 10,
    time: overrides.time,
    appointmentTypeID: overrides.appointmentTypeID ?? 94471769,
    name: overrides.name ?? 'Preschool Program',
    description: overrides.description ?? '',
    price: overrides.price ?? '54',
    duration: overrides.duration ?? 150,
})

const makeDiscountCode = (overrides: { discountType: 'percentage' | 'price'; discountAmount: number; code: string }) =>
    ({
        id: overrides.code,
        code: overrides.code,
        discountType: overrides.discountType,
        discountAmount: overrides.discountAmount,
        expiryDate: new Date('2099-01-01T00:00:00.000Z'),
        numberOfUses: 0,
        numberOfUsesAllocated: 100,
    }) as any

const makeGiftCard = (balanceRemainingCents: number) => ({
    id: 'gift-card-1',
    state: 'ACTIVE' as const,
    balanceAppliedCents: 0,
    balanceRemainingCents,
    last4: '1234',
})

describe('preschool-v2 cart store', () => {
    beforeEach(() => {
        resetStore()
    })

    it('applies full-term discount to selected term sessions', () => {
        const classes = [
            makeClass({ id: 1, time: new Date('2026-06-15T00:00:00.000Z') }),
            makeClass({ id: 2, time: new Date('2026-06-22T00:00:00.000Z') }),
            makeClass({ id: 3, time: new Date('2026-06-29T00:00:00.000Z') }),
        ]

        useCart.getState().selectEntireTermGroup(classes)

        expect(useCart.getState().subtotal).toBe(162)
        expect(useCart.getState().fullTermDiscount).toBe(32.4)
        expect(useCart.getState().total).toBe(129.6)
        expect(Object.keys(useCart.getState().fullTermClassIds).map(Number).sort()).toEqual([1, 2, 3])
    })

    it('calculates percentage discount codes from the post-full-term discounted subtotal', () => {
        const fullTermClasses = [
            makeClass({ id: 1, time: new Date('2026-06-15T00:00:00.000Z') }),
            makeClass({ id: 2, time: new Date('2026-06-22T00:00:00.000Z') }),
            makeClass({ id: 3, time: new Date('2026-06-29T00:00:00.000Z') }),
        ]
        const extraClasses = [
            makeClass({ id: 4, time: new Date('2026-06-24T04:00:00.000Z') }),
            makeClass({ id: 5, time: new Date('2026-07-01T04:00:00.000Z') }),
        ]

        useCart.getState().selectEntireTermGroup(fullTermClasses)
        extraClasses.forEach((klass) => useCart.getState().toggleClass(klass, []))
        const result = useCart
            .getState()
            .applyDiscountCode(makeDiscountCode({ code: '10', discountType: 'percentage', discountAmount: 10 }))

        expect(result.error).toBeNull()
        expect(useCart.getState().subtotal).toBe(270)
        expect(useCart.getState().fullTermDiscount).toBe(32.4)
        expect(useCart.getState().discountCodeAmount).toBe(23.76)
        expect(useCart.getState().total).toBe(213.84)
        expect(useCart.getState().totalCents).toBe(21384)
    })

    it('applies gift cards after discounts without changing the order total', () => {
        useCart.getState().toggleClass(makeClass({ id: 1, time: new Date('2026-06-15T00:00:00.000Z') }), [])
        useCart
            .getState()
            .applyDiscountCode(makeDiscountCode({ code: 'TEN', discountType: 'price', discountAmount: 10 }))

        useCart.getState().applyGiftCard(makeGiftCard(2500))

        expect(useCart.getState().total).toBe(44)
        expect(useCart.getState().totalShownToCustomer).toBe(19)
        expect(useCart.getState().giftCard?.balanceAppliedCents).toBe(2500)
        expect(useCart.getState().giftCard?.balanceRemainingCents).toBe(0)
    })

    it('recalculates full-term totals when child count changes', () => {
        const classes = [
            makeClass({ id: 1, time: new Date('2026-06-15T00:00:00.000Z') }),
            makeClass({ id: 2, time: new Date('2026-06-22T00:00:00.000Z') }),
        ]

        useCart.getState().selectEntireTermGroup(classes)
        useCart.getState().setChildCount(2)

        expect(useCart.getState().subtotal).toBe(216)
        expect(useCart.getState().fullTermDiscount).toBe(43.2)
        expect(useCart.getState().total).toBe(172.8)
    })

    it('rejects fixed discount codes larger than the post-full-term discounted subtotal', () => {
        useCart
            .getState()
            .selectEntireTermGroup([makeClass({ id: 1, price: '40', time: new Date('2026-06-15T00:00:00.000Z') })])

        const result = useCart
            .getState()
            .applyDiscountCode(makeDiscountCode({ code: 'TOO-MUCH', discountType: 'price', discountAmount: 33 }))

        expect(result.error).toMatch(/greater than the total/i)
        expect(useCart.getState().discountCode).toBeNull()
        expect(useCart.getState().total).toBe(32)
    })

    it('uses the configured full-term discount percentage', () => {
        expect(FULL_TERM_DISCOUNT_PERCENTAGE).toBe(20)
    })
})
