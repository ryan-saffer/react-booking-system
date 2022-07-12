export type CreatePaymentIntentParams = {
    name: string
    email: string
    phone: string
    amount: number
    description: string
    program: 'holiday_program' | 'science_club'
}

export type CreatePaymentIntentResponse = {
    id: string
    clientSecret: string
}

export type Metadata = {
    program?: 'holiday_program' | 'science_club'
}