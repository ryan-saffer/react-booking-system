import * as functions from 'firebase-functions'
import { FirebaseFunctions } from 'fizz-kidz'

export function onCall<T extends keyof FirebaseFunctions>(
    fn: (
        input: FirebaseFunctions[T]['input'],
        _context: functions.https.CallableContext
    ) => FirebaseFunctions[T]['result']['data'] | Promise<FirebaseFunctions[T]['result']['data']>
) {
    return functions.region('australia-southeast1').https.onCall(fn)
}
