import { DiscountCode } from '..'

export type CreatePaymentIntentParams = {
    name: string
    email: string
    phone: string
    amount: number
    description: string
    programs: { childName: string; dateTime: string; amount: number }[]
    programType: 'holiday_program' | 'science_club' | 'studio_opening'
    discount: DiscountCode | undefined
}

export type CreatePaymentIntentResponse = {
    id: string
    clientSecret: string
}

export type Metadata = {
    programType: 'holiday_program' | 'science_club' | 'studio_opening'
    discount: string
    programCount: string
}

export type UpdatePaymentIntentParams = {
    id: string
    amount: number
    programs: { childName: string; dateTime: string; amount: number }[]
    discount: DiscountCode | undefined
}
