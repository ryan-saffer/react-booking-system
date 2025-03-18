import { capitalise } from '@utils/stringUtilities'
import { AcuityConstants, AcuityTypes, DiscountCode } from 'fizz-kidz'

export const PRICE_MAP: Record<
    AcuityConstants.AppointmentTypeValue,
    { PROGRAM_PRICE: number; DISCOUNT_PRICE: number }
> = {
    [AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM]: {
        PROGRAM_PRICE: 54,
        DISCOUNT_PRICE: 4,
    },
    [AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM]: {
        PROGRAM_PRICE: 54,
        DISCOUNT_PRICE: 4,
    },
}

export function calculateTotal(
    appointmentTypeId: AcuityConstants.AppointmentTypeValue,
    selectedClasses: AcuityTypes.Api.Class[],
    discountedClasses: number[],
    numberOfChildren: number,
    discount?: DiscountCode
) {
    const originalTotal = selectedClasses.length * numberOfChildren * PRICE_MAP[appointmentTypeId].PROGRAM_PRICE
    let amountDiscounted: number
    if (discount) {
        amountDiscounted = calculateDiscountedAmount(originalTotal, discount)
    } else {
        amountDiscounted = discountedClasses.length * numberOfChildren * PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE
    }
    const totalPrice = originalTotal - amountDiscounted

    return {
        originalTotal,
        totalPrice,
    }
}

export function calculateDiscountedAmount(total: number, discount: DiscountCode) {
    switch (discount.discountType) {
        case 'percentage':
            return total * (discount.discountAmount / 100)
        case 'price':
            return discount.discountAmount
    }
}

export function getSameDayClasses(classes: AcuityTypes.Api.Class[]) {
    return [] // removing this feature for now
    const sameDayClasses: number[] = []
    for (let i = 0; i < classes.length; i++) {
        for (let j = i + 1; j < classes.length; j++) {
            const date1 = new Date(classes[i].time)
            const date2 = new Date(classes[j].time)
            if (date1.getDate() === date2.getDate()) {
                sameDayClasses.push(classes[i].id)
                sameDayClasses.push(classes[j].id)
            }
        }
    }

    return sameDayClasses
}

export function getProgramName(
    appointmentTypeId: AcuityConstants.AppointmentTypeValue,
    selectedStore: string,
    parentFirstName: string,
    parentLastName: string
) {
    switch (appointmentTypeId) {
        case AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM:
        case AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM:
            return `${capitalise(selectedStore)} Store Holiday Program - ${parentFirstName} ${parentLastName}`
        default: {
            const exhaustiveCheck: never = appointmentTypeId
            throw new Error(`Unhandled value for getProgramName(): '${exhaustiveCheck}'`)
        }
    }
}

export function getProgramType(appointmentTypeId: AcuityConstants.AppointmentTypeValue) {
    switch (appointmentTypeId) {
        case AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM:
        case AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM:
            return 'holiday_program' as const
        default: {
            const exhaustiveCheck: never = appointmentTypeId
            throw new Error(`Unhandled value for getProgramType(): '${exhaustiveCheck}'`)
        }
    }
}
