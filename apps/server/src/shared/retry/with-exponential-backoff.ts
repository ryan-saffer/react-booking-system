import { logger } from 'firebase-functions/v2'

/** Retry a function up to three times with exponential backoff for expected error codes. */
export function withExponentialBackoff<T extends () => any>(fn: T, backoffCodes: number[]): Promise<ReturnType<T>> {
    let retryCount = 0
    return new Promise((resolve, reject) => {
        const runFunction = async () => {
            try {
                const result = await fn()
                resolve(result)
            } catch (err: any) {
                if (backoffCodes.includes(err.code)) {
                    if (retryCount <= 2) {
                        logger.log(`Error code ${err.code} found. Running again, with retryCount of ${retryCount + 1}`)
                        setTimeout(runFunction, Math.pow(2, retryCount + 1))
                        retryCount++
                    } else {
                        reject(err)
                    }
                } else {
                    reject(err)
                }
            }
        }

        runFunction().catch(reject)
    })
}
