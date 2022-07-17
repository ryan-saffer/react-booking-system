import { Certificate } from "../acuity"

export type CreatePaymentIntentParams = {
    name: string
    email: string
    phone: string
    amount: number
    description: string,
    programs: { description: string, amount: number }[]
    programType: 'holiday_program' | 'science_club'
    discount: Certificate | undefined
}

export type CreatePaymentIntentResponse = {
    id: string
    clientSecret: string
}

export type Metadata = {
    programType?: 'holiday_program' | 'science_club'
}

export type UpdatePaymentIntentParams = {
    id: string
    amount: number
    programs: { description: string, amount: number }[]
    discount: Certificate | undefined
}