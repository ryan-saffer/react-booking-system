import firebase from "firebase";
import Firebase from "../../../components/Firebase";
import { FirebaseFunctions } from 'fizz-kidz'

export function callFirebaseFunction<K extends keyof FirebaseFunctions>(fn: K, firebase: Firebase) {
    return function (input: FirebaseFunctions[K]['input']): Promise<FirebaseFunctions[K]['result']> {
        return new Promise((resolve, reject) => {
            firebase.functions.httpsCallable(fn)(input)
                .then(result => resolve(result))
                .catch(error => {
                    if (isFunctionsError(error)) {
                        console.error(
                            `error running '${fn}'`,
                            '--statusCode:', `'${error.code}'`,
                            '--message:', `'${error.message}'`,
                            '--details:', `'${error.details}'`
                        )
                    } else {
                        console.error(
                            `error running '${fn}'`,
                            '--errorObject:', `'${error}'`
                        )
                    }
                    reject(error)
                })
        })
    }
}

// determine if an error is a firebase functions HttpsError
function isFunctionsError(err: any): err is firebase.functions.HttpsError {
    const error = (err as firebase.functions.HttpsError)
    return  error.code !== undefined && 
            error.message !== undefined && 
            error.name !== undefined
}