import firebase from "firebase";
import Firebase from "../../components/Firebase";
import { FirebaseFunctions, Acuity } from 'fizz-kidz'

export function callFirebaseFunction<K extends keyof FirebaseFunctions>(fn: K, firebase: Firebase) {
    return function (input: FirebaseFunctions[K]['input']): Promise<FirebaseFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions.httpsCallable(fn)(input)
                .then(result => resolve(result))
                .catch(error => {
                    logError(error, fn)
                    reject(error)
                })
        })
    }
}

export function callAcuityClient<K extends keyof Acuity.Client.AcuityFunctions>(fn: K, firebase: Firebase) {
    return function (input: Acuity.Client.AcuityFunctions[K]['input']): Promise<Acuity.Client.AcuityFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions.httpsCallable('acuityClient')({ data: { method: fn, ...input } })
                .then(result => resolve(result))
                .catch(error => {
                    logError(error, fn)
                    reject(error)
                })
        })
    }
}

export function callAcuityClientV2<K extends keyof Acuity.Client.AcuityFunctions>(method: K, firebase: Firebase) {
    return function (input: Acuity.Client.AcuityFunctions[K]['input']): Promise<Acuity.Client.AcuityFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions.httpsCallable('acuityClientV2')({ method, input })
                .then(result => resolve(result))
                .catch(error => {
                    logError(error, method)
                    reject(error)
                })
        })
    }
}

// determine if an error is a firebase functions HttpsError
function isFunctionsError(err: any): err is firebase.functions.HttpsError {
    const error = (err as firebase.functions.HttpsError)
    return error.code !== undefined &&
        error.message !== undefined &&
        error.name !== undefined
}

function logError(error: any, fn: string) {
    if (isFunctionsError(error)) {
        console.error(
            `error running '${fn}'`,
            '--statusCode:', `'${error.code}'`,
            '--message:', `'${error.message}'`,
            '--details:', error.details
        )
    } else {
        console.error(
            `error running '${fn}'`,
            '--errorObject:', error
        )
    }
}