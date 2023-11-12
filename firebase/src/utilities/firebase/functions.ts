import firebase from 'firebase/compat/app'
import Firebase from '../../components/Firebase'
import { FirebaseFunctions, AcuityTypes } from 'fizz-kidz'

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

export function callAcuityClient<K extends keyof AcuityTypes.Client.AcuityFunctions>(method: K, firebase: Firebase) {
    return function (
        input: AcuityTypes.Client.AcuityFunctions[K]['input']
    ): Promise<AcuityTypes.Client.AcuityFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions
                .httpsCallable('acuityClient')({ method, input })
                .then((result) => resolve(result))
                .catch((error) => {
                    if (isFunctionsError(error)) {
                        logFunctionsError(method, error)
                        reject(error.details)
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

function logFunctionsError(fn: string, error: firebase.functions.HttpsError) {
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
    console.error(`error running: '${fn}`, '--code:', error.code, '--details:', error.details ?? error)
}
