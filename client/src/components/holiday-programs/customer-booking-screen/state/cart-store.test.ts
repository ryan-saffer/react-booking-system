import { beforeEach, describe, expect, it } from 'vitest'

import { useCart } from './cart-store'

const resetStore = () =>
    useCart.setState({
        selectedStudio: null,
        selectedClasses: {},
        sameDayClasses: [],
        subtotal: 0,
        total: 0,
        totalShownToCustomer: 0,
        discount: null,
        giftCard: null,
    })

const createClass = ({ id, price, time }: { id: number; price: number; time: string }): any => ({
    id,
    price: price.toString(),
    time,
    appointmentTypeID: id,
    calendarID: id,
})

const createGiftCard = (balanceRemainingCents: number) => ({
    id: 'gc-1',
    state: 'ACTIVE',
    balanceAppliedCents: 0,
    balanceRemainingCents,
    last4: '1234',
})

describe('cart-store', () => {
    beforeEach(() => {
        resetStore()
    })

    it('sets and clears selected studio', () => {
        useCart.getState().setSelectedStudio('richmond' as any)
        expect(useCart.getState().selectedStudio).toBe('richmond')

        useCart.getState().clearCart()
        expect(useCart.getState().selectedClasses).toEqual({})
        expect(useCart.getState().sameDayClasses).toEqual([])
    })

    it('adds and removes classes while recalculating totals', () => {
        const klass = createClass({
            id: 1,
            price: 25,
            time: '2024-01-01T10:00:00.000Z',
        })

        useCart.getState().toggleClass(klass, 2)
        expect(useCart.getState().selectedClasses[klass.id]).toBeDefined()
        expect(useCart.getState().subtotal).toBe(50)
        expect(useCart.getState().total).toBe(50)

        useCart.getState().toggleClass(klass, 2)
        expect(useCart.getState().selectedClasses[klass.id]).toBeUndefined()
        expect(useCart.getState().subtotal).toBe(0)
        expect(useCart.getState().total).toBe(0)
    })

    it('identifies same-day classes', () => {
        const morning = createClass({
            id: 1,
            price: 20,
            time: '2024-01-01T09:00:00.000Z',
        })
        const afternoon = createClass({
            id: 2,
            price: 20,
            time: '2024-01-01T13:00:00.000Z',
        })

        useCart.getState().toggleClass(morning, 1)
        useCart.getState().toggleClass(afternoon, 1)

        expect(useCart.getState().sameDayClasses.sort()).toEqual([1, 2])
    })

    it('applies and clears percentage discounts', () => {
        const klass = createClass({
            id: 1,
            price: 40,
            time: '2024-01-02T10:00:00.000Z',
        })
        useCart.getState().toggleClass(klass, 1)

        useCart.getState().applyDiscount({ code: 'HALF', discountType: 'percentage', discountAmount: 50 } as any, 1)
        expect(useCart.getState().discount?.code).toBe('HALF')
        expect(useCart.getState().total).toBe(20)

        useCart.getState().clearDiscount(1)
        expect(useCart.getState().discount).toBeNull()
        expect(useCart.getState().total).toBe(40)
    })

    it('applies fixed amount discounts', () => {
        const klass = createClass({
            id: 1,
            price: 30,
            time: '2024-01-03T10:00:00.000Z',
        })
        useCart.getState().toggleClass(klass, 1)

        useCart.getState().applyDiscount({ code: 'MINUS5', discountType: 'price', discountAmount: 5 } as any, 1)
        expect(useCart.getState().total).toBe(25)
    })

    it('calculates totals across multiple kids and classes', () => {
        const classA = createClass({
            id: 1,
            price: 15,
            time: '2024-02-01T09:00:00.000Z',
        })
        const classB = createClass({
            id: 2,
            price: 20,
            time: '2024-02-02T09:00:00.000Z',
        })
        useCart.getState().toggleClass(classA, 2)
        useCart.getState().toggleClass(classB, 2)

        expect(useCart.getState().subtotal).toBe((15 + 20) * 2)
        expect(useCart.getState().total).toBe((15 + 20) * 2)
    })

    it('returns the earliest class date when classes are selected', () => {
        const later = createClass({
            id: 1,
            price: 10,
            time: '2024-03-10T12:00:00.000Z',
        })
        const earlier = createClass({
            id: 2,
            price: 10,
            time: '2024-03-01T09:00:00.000Z',
        })

        useCart.getState().toggleClass(later, 1)
        useCart.getState().toggleClass(earlier, 1)

        const earliest = useCart.getState().getEarliestClass()
        expect(earliest.toISOString()).toBe(earlier.time)
    })

    describe('gift card application', () => {
        it('applies gift card when balance exceeds total', () => {
            const klass = createClass({
                id: 1,
                price: 50,
                time: '2024-04-01T09:00:00.000Z',
            })
            useCart.getState().toggleClass(klass, 1)

            const giftCard = createGiftCard(8000) // $80
            useCart.getState().applyGiftCard(giftCard as any, 1)

            const state = useCart.getState()
            expect(state.total).toBe(50)
            expect(state.totalShownToCustomer).toBe(0)
            expect(state.giftCard?.balanceAppliedCents).toBe(5000)
            expect(state.giftCard?.balanceRemainingCents).toBe(3000)
        })

        it('applies gift card when balance is less than total', () => {
            const klass = createClass({
                id: 1,
                price: 50,
                time: '2024-04-02T09:00:00.000Z',
            })
            useCart.getState().toggleClass(klass, 1)

            const giftCard = createGiftCard(3000) // $30
            useCart.getState().applyGiftCard(giftCard as any, 1)

            const state = useCart.getState()
            expect(state.total).toBe(50)
            expect(state.totalShownToCustomer).toBe(20)
            expect(state.giftCard?.balanceAppliedCents).toBe(3000)
            expect(state.giftCard?.balanceRemainingCents).toBe(0)
        })

        it('applies gift card when balance equals total', () => {
            const klass = createClass({
                id: 1,
                price: 50,
                time: '2024-04-03T09:00:00.000Z',
            })
            useCart.getState().toggleClass(klass, 1)

            const giftCard = createGiftCard(5000) // $50
            useCart.getState().applyGiftCard(giftCard as any, 1)

            const state = useCart.getState()
            expect(state.total).toBe(50)
            expect(state.totalShownToCustomer).toBe(0)
            expect(state.giftCard?.balanceAppliedCents).toBe(5000)
            expect(state.giftCard?.balanceRemainingCents).toBe(0)
        })

        it('clears gift card when total becomes zero', () => {
            const giftCard = createGiftCard(5000) // $50
            useCart.getState().applyGiftCard(giftCard as any, 1)

            // No classes selected, total is 0 -> gift card cleared
            expect(useCart.getState().giftCard).toBeNull()
        })

        it('clearing gift card restores customer total', () => {
            const klass = createClass({
                id: 1,
                price: 50,
                time: '2024-04-04T09:00:00.000Z',
            })
            useCart.getState().toggleClass(klass, 1)

            const giftCard = createGiftCard(8000) // $80
            useCart.getState().applyGiftCard(giftCard as any, 1)
            expect(useCart.getState().totalShownToCustomer).toBe(0)

            useCart.getState().clearGiftCard(1)
            expect(useCart.getState().giftCard).toBeNull()
            expect(useCart.getState().totalShownToCustomer).toBe(50)
        })
    })
})
