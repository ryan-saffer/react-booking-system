import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

export function getErrorCode(error: Error | undefined, defaultCode: TRPC_ERROR_CODE_KEY): AppErrorCode {
    if (error instanceof PaymentMethodInvalidError) {
        return 'PAYMENT_METHOD_INVALID'
    }
    if (error instanceof ClassFullError) {
        return 'CLASS_FULL'
    }
    return defaultCode
}

// MARK: Custom errors
export type AppErrorCode = TRPC_ERROR_CODE_KEY | 'PAYMENT_METHOD_INVALID' | 'CLASS_FULL'

export class PaymentMethodInvalidError extends Error {
    constructor(message?: string) {
        super(message ?? 'Payment method is invalid')
        this.name = 'PaymentMethodInvalidError'
    }
}

export class ClassFullError extends Error {
    constructor(message?: string) {
        super(message ?? 'One or more of the selected classes does not have enough spots available')
        this.name = 'ClassFullError'
    }
}
