export type CreatePaymentIntentParams = {
    amount: number
    description: string
}

export type CreatePaymentIntentResponse = {
    id: string
    clientSecret: string
}