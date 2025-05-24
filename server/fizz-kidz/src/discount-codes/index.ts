export type DiscountCode = {
    id: string
    discountType: 'percentage' | 'price'
    discountAmount: number
    code: string
    expiryDate: Date
    numberOfUses: number
    numberOfUsesAllocated: number
}
