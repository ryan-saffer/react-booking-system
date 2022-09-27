import firebase from 'firebase'
import Firebase from '../../components/Firebase'
import { FirebaseFunctions, Acuity } from 'fizz-kidz'

export function callFirebaseFunction<K extends keyof FirebaseFunctions>(fn: K, firebase: Firebase) {
    return function (input: FirebaseFunctions[K]['input']): Promise<FirebaseFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions
                .httpsCallable(fn)(input)
                .then((result) => resolve(result))
                .catch((error) => {
                    logGenericError(fn, error)
                    reject(error)
                })
        })
    }
}

/**
 * @deprecated Uses the deprecated `acuityClient` firebase function. Use {@link callAcuityClientV2} instead.
 */
export function callAcuityClient<K extends keyof Acuity.Client.AcuityFunctions>(fn: K, firebase: Firebase) {
    return function (
        input: Acuity.Client.AcuityFunctions[K]['input']
    ): Promise<Acuity.Client.AcuityFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions
                .httpsCallable('acuityClient')({ data: { method: fn, ...input } })
                .then((result) => resolve(result))
                .catch((error) => {
                    logGenericError(fn, error)
                    reject(error)
                })
        })
    }
}

export function callAcuityClientV2<K extends keyof Acuity.Client.AcuityFunctions>(method: K, firebase: Firebase) {
    return function (
        input: Acuity.Client.AcuityFunctions[K]['input']
    ): Promise<Acuity.Client.AcuityFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions
                .httpsCallable('acuityClientV2')({ method, input })
                .then((result) => resolve(result))
                .catch((error) => {
                    if (isFunctionsError(error)) {
                        const { details } = JSON.parse(JSON.stringify(error))
                        logFunctionsError(method, error, details)
                        reject(details)
                    } else {
                        logGenericError(method, error)
                        reject(error)
                    }
                })
        })
    }
}

// determine if an error is a firebase functions HttpsError
function isFunctionsError(err: any): err is firebase.functions.HttpsError {
    const error = err as firebase.functions.HttpsError
    return (
        error.code !== undefined &&
        error.message !== undefined &&
        error.name !== undefined &&
        error.details !== undefined
    )
}

function logFunctionsError(fn: string, error: firebase.functions.HttpsError, details: any) {
    console.error(
        `error running '${fn}'`,
        '--statusCode:',
        `'${error.code}'`,
        '--message:',
        `'${error.message}'`,
        '--details:',
        error.details
    )
}

function logGenericError(fn: string, error: firebase.functions.HttpsError) {
    console.error(`error running: '${fn}`, '--code:', error.code, '--details:', error.details)
}
