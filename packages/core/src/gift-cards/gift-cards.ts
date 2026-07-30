export type GiftCard = {
    id: string
    state: 'ACTIVE' | 'DEACTIVATED' | 'BLOCKED' | 'PENDING' | 'UNKNOWN'
    balanceAppliedCents: number
    balanceRemainingCents: number
    last4: string
}
