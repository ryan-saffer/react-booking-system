import { Acuity } from 'fizz-kidz'

const PROGRAM_PRICE = 45

export function calculateTotal(selectedClasses: Acuity.Class[], discountedClasses: number[], numberOfChildren: number) {
    const originalTotal = selectedClasses.length * numberOfChildren * PROGRAM_PRICE
    console.log('originalTotal', originalTotal)
    const amountDiscounted = discountedClasses.length * numberOfChildren * 5
    console.log('amountDiscounted', amountDiscounted)
    const totalPrice = originalTotal - amountDiscounted
    console.log('total', totalPrice)

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
