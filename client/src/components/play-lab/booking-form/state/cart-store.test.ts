import { beforeEach, describe, expect, it } from 'vitest'

import { PRICING_STRUCTURE, type LocalAcuityClass, useCart } from './cart-store'

const resetStore = () =>
    useCart.setState({
        selectedClasses: {},
        discount: null,
        subtotal: 0,
        totalShownToCustomer: 0,
        total: 0,
        giftCard: null,
    })

const makeClass = (
    overrides: Partial<Omit<LocalAcuityClass, 'price'>> & { id: number; price: number; time: Date }
): LocalAcuityClass => ({
    id: overrides.id,
    price: overrides.price.toString(),
    time: overrides.time,
    name: overrides.name ?? `Class ${overrides.id}`,
    description: overrides.description ?? '',
    duration: overrides.duration ?? 60,
    // category: overrides.category ?? '',
    calendarID: overrides.calendarID ?? 1,
    appointmentTypeID: overrides.appointmentTypeID ?? overrides.id,
    calendar: '',
    slotsAvailable: 20,
    // certificates: overrides.certificates ?? [],
    // location: overrides.location ?? '',
})

const makeGiftCard = (balanceRemainingCents: number) => ({
    id: 'gc-1',
    state: 'ACTIVE' as const,
    balanceAppliedCents: 0,
    balanceRemainingCents,
    last4: '1234',
})

describe('play-lab cart store', () => {
    beforeEach(() => {
        resetStore()
    })

    it('toggles classes and recalculates totals', () => {
        const klass = makeClass({ id: 1, price: 26, time: new Date('2024-01-01T10:00:00Z') })
        useCart.getState().toggleClass(klass, 1, false)

        expect(useCart.getState().selectedClasses[klass.id]).toBeDefined()
        expect(useCart.getState().subtotal).toBe(26)

        useCart.getState().toggleClass(klass, 1, false)
        expect(useCart.getState().selectedClasses[klass.id]).toBeUndefined()
        expect(useCart.getState().subtotal).toBe(0)
    })

    it('sets selected classes in bulk and calculates totals', () => {
        const classes = [
            makeClass({ id: 1, price: 26, time: new Date('2024-01-01T10:00:00Z') }),
            makeClass({ id: 2, price: 22, time: new Date('2024-01-02T10:00:00Z') }),
        ]
        useCart.getState().setSelectedClasses(classes, 2)

        expect(Object.keys(useCart.getState().selectedClasses)).toHaveLength(2)
        expect(useCart.getState().subtotal).toBe((26 + 22) * 2)
    })

    it('applies multi-session discount when better than code', () => {
        const classes = [
            makeClass({ id: 1, price: 26, time: new Date('2024-01-01T10:00:00Z') }),
            makeClass({ id: 2, price: 26, time: new Date('2024-01-02T10:00:00Z') }),
        ]
        useCart.getState().setSelectedClasses(classes, 1)

        // two sessions → pricing structure discount 4 per session
        const expectedDiscount = PRICING_STRUCTURE.find((p) => p.minSessions === 2)!.discount * classes.length
        expect(useCart.getState().discount?.isMultiSessionDiscount).toBe(true)
        expect(useCart.getState().total).toBe(52 - expectedDiscount)

        // Apply a weaker discount code; should reject with error and keep multi-session
        const result = useCart
            .getState()
            .applyDiscountCode({ discountType: 'price', discountAmount: 1, code: 'SMALL' }, 1, false)
        expect(result.error).toMatch(/less than the already applied 'multi session discount'/i)
        expect(useCart.getState().discount?.isMultiSessionDiscount).toBe(true)
    })

    it('applies discount code when better than multi-session discount', () => {
        const classes = [
            makeClass({ id: 1, price: 26, time: new Date('2024-01-01T10:00:00Z') }),
            makeClass({ id: 2, price: 26, time: new Date('2024-01-02T10:00:00Z') }),
        ]
        useCart.getState().setSelectedClasses(classes, 1)

        // Apply a strong discount code
        const result = useCart
            .getState()
            .applyDiscountCode({ discountType: 'price', discountAmount: 20, code: 'STRONG' }, 1, false)
        expect(result.error).toBeNull()
        expect(useCart.getState().discount?.isMultiSessionDiscount).toBe(false)
        expect((useCart.getState().discount as any).code).toBe('STRONG')
    })

    it('rejects discount codes larger than subtotal', () => {
        const classes = [makeClass({ id: 1, price: 10, time: new Date('2024-01-01T10:00:00Z') })]
        useCart.getState().setSelectedClasses(classes, 1)

        const result = useCart
            .getState()
            .applyDiscountCode({ discountType: 'price', discountAmount: 20, code: 'TOO-MUCH' }, 1, false)
        expect(result.error).toMatch(/greater than the total/i)
        // discount should remain unchanged
        expect((useCart.getState().discount as any)?.code).toBeUndefined()
    })

    it('removes discount and recalculates', () => {
        const klass = makeClass({ id: 1, price: 26, time: new Date('2024-01-01T10:00:00Z') })
        useCart.getState().toggleClass(klass, 1, false)
        useCart.getState().applyDiscountCode({ discountType: 'price', discountAmount: 5, code: 'MINUS5' }, 1, false)
        expect((useCart.getState().discount as any).code).toBe('MINUS5')

        useCart.getState().removeDiscount(1)
        expect(useCart.getState().discount).toBeNull()
        expect(useCart.getState().total).toBe(26)
    })

    describe('gift cards', () => {
        it('applies gift card when balance exceeds total', () => {
            const klass = makeClass({ id: 1, price: 30, time: new Date('2024-05-01T10:00:00Z') })
            useCart.getState().toggleClass(klass, 1, false)

            useCart.getState().applyGiftCard(makeGiftCard(8000) as any, 1) // $80

            const state = useCart.getState()
            expect(state.total).toBe(30)
            expect(state.totalShownToCustomer).toBe(0)
            expect(state.giftCard?.balanceAppliedCents).toBe(3000)
            expect(state.giftCard?.balanceRemainingCents).toBe(5000)
        })

        it('applies partial gift card when balance is less than total', () => {
            const klass = makeClass({ id: 1, price: 50, time: new Date('2024-05-02T10:00:00Z') })
            useCart.getState().toggleClass(klass, 1, false)

            useCart.getState().applyGiftCard(makeGiftCard(2000) as any, 1) // $20

            const state = useCart.getState()
            expect(state.total).toBe(50)
            expect(state.totalShownToCustomer).toBe(30)
            expect(state.giftCard?.balanceAppliedCents).toBe(2000)
            expect(state.giftCard?.balanceRemainingCents).toBe(0)
        })

        it('clears gift card when total is zero', () => {
            useCart.getState().applyGiftCard(makeGiftCard(2000) as any, 1)
            expect(useCart.getState().giftCard).toBeNull()
        })

        it('clearing gift card restores totals', () => {
            const klass = makeClass({ id: 1, price: 40, time: new Date('2024-05-03T10:00:00Z') })
            useCart.getState().toggleClass(klass, 1, false)
            useCart.getState().applyGiftCard(makeGiftCard(8000) as any, 1)
            expect(useCart.getState().totalShownToCustomer).toBe(0)

            useCart.getState().clearGiftCard(1)
            expect(useCart.getState().giftCard).toBeNull()
            expect(useCart.getState().totalShownToCustomer).toBe(40)
        })
    })

    it('returns the earliest class date', () => {
        const later = makeClass({ id: 1, price: 20, time: new Date('2024-06-10T12:00:00Z') })
        const earlier = makeClass({ id: 2, price: 20, time: new Date('2024-06-01T09:00:00Z') })

        useCart.getState().toggleClass(later, 1, false)
        useCart.getState().toggleClass(earlier, 1, false)

        const earliest = useCart.getState().getEarliestClassDate()
        expect(earliest.toISOString()).toBe(earlier.time.toISOString())
    })
})
