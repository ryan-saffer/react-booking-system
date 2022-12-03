import { es } from 'date-fns/locale'
import { Acuity } from 'fizz-kidz'

export const PROGRAM_PRICE = 45
export const DISCOUNT_PRICE = 5

export function calculateTotal(
    selectedClasses: Acuity.Class[],
    discountedClasses: number[],
    numberOfChildren: number,
    discount?: Acuity.Certificate
) {
    const originalTotal = selectedClasses.length * numberOfChildren * PROGRAM_PRICE
    let amountDiscounted: number
    if (discount) {
        amountDiscounted = calculateDiscountedAmount(originalTotal, discount)
    } else {
        amountDiscounted = discountedClasses.length * numberOfChildren * DISCOUNT_PRICE
    }
    const totalPrice = originalTotal - amountDiscounted

    return {
        originalTotal,
        totalPrice,
    }
}

export function calculateDiscountedAmount(total: number, discount: Acuity.Certificate) {
    switch (discount.discountType) {
        case 'percentage':
            return total * (discount.discountAmount / 100)
        case 'price':
            return discount.discountAmount
    }
}

export function getSameDayClasses(classes: Acuity.Class[]) {
    const sameDayClasses: number[] = []
    for (let i = 0; i < classes.length; i++) {
        for (let j = i + 1; j < classes.length; j++) {
            let date1 = new Date(classes[i].time)
            let date2 = new Date(classes[j].time)
            if (date1.getDate() === date2.getDate()) {
                sameDayClasses.push(classes[i].id)
                sameDayClasses.push(classes[j].id)
            }
        }
    }

    return sameDayClasses
}
