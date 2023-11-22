import * as ApiTypes from '../acuity/types/apiTypes'

export type CreatePaymentIntentParams = {
    name: string
    email: string
    phone: string
    amount: number
    description: string
    programs: { childName: string; dateTime: string; amount: number }[]
    programType: 'holiday_program' | 'science_club'
    discount: ApiTypes.Certificate | undefined
}

export type CreatePaymentIntentResponse = {
    id: string
    clientSecret: string
}

export type Metadata = {
    programType: 'holiday_program' | 'science_club'
    discount: string
    programCount: string
}

export type UpdatePaymentIntentParams = {
    id: string
    amount: number
    programs: { childName: string; dateTime: string; amount: number }[]
    discount: ApiTypes.Certificate | undefined
}
