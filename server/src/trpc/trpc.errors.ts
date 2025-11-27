import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

export function getErrorCode(error: Error | undefined, defaultCode: TRPC_ERROR_CODE_KEY): AppErrorCode {
    if (error instanceof PaymentMethodInvalidError) {
        return 'PAYMENT_METHOD_INVALID'
    }
    if (error instanceof ClassFullError) {
        return 'CLASS_FULL'
    }
    if (error instanceof GiftCardInactiveError) {
        return 'GIFT_CARD_INACTIVE'
    }
    return defaultCode
}

// MARK: Custom errors
export type AppErrorCode = TRPC_ERROR_CODE_KEY | 'PAYMENT_METHOD_INVALID' | 'CLASS_FULL' | 'GIFT_CARD_INACTIVE'

/**
 * This class just exists to ensure only custom errors can be thrown by throwCustomTrpcError()
 */
export abstract class CustomTrpcError extends Error {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // ← this private field makes the class nominal
    private readonly _customTrpcErrorBrand!: void

    constructor(message?: string) {
        super(message)
        // restore correct prototype chain (for `instanceof` checks at runtime)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class PaymentMethodInvalidError extends CustomTrpcError {
    constructor(message?: string) {
        super(message ?? 'Payment method is invalid')
        this.name = 'PaymentMethodInvalidError'
    }
}

export class ClassFullError extends CustomTrpcError {
    constructor(message?: string) {
        super(message ?? 'One or more of the selected classes does not have enough spots available')
        this.name = 'ClassFullError'
    }
}

export class GiftCardInactiveError extends CustomTrpcError {
    constructor(message?: string) {
        super(message ?? 'The provided gift card is not active and cannot be used')
        this.name = 'GiftCardInactiveError'
    }
}
