import { Timestamp } from 'firebase/firestore'

import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'

export function convertTimestamps<T extends object>(input: T): T {
    const data = input as any
    Object.keys(input).forEach((key) => {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate()
        }
    })
    return data
}

export const timestampConverter = <T extends object>(): FirestoreDataConverter<T> => ({
    fromFirestore(snapshot: QueryDocumentSnapshot<T>): T {
        const data = snapshot.data()
        return convertTimestamps(data)
    },

    toFirestore(data: T) {
        return data
    },
})
