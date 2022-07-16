import { Acuity } from 'fizz-kidz'

const PROGRAM_PRICE = 45
const DISCOUNT_PRICE = 5

export function calculateTotal(selectedClasses: Acuity.Class[], discountedClasses: number[], numberOfChildren: number) {
    const originalTotal = selectedClasses.length * numberOfChildren * PROGRAM_PRICE
    const amountDiscounted = discountedClasses.length * numberOfChildren * DISCOUNT_PRICE
    const totalPrice = originalTotal - amountDiscounted

    return {
        originalTotal,
        totalPrice,
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
