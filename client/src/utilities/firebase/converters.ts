import firebase from 'firebase/compat/app'

export function convertTimestamps<T extends object>(input: T): T {
    const data = input as any
    Object.keys(input).forEach((key) => {
        if (data[key] instanceof firebase.firestore.Timestamp) {
            data[key] = data[key].toDate()
        }
    })
    return data
}

export const timestampConverter = {
    fromFirestore<T extends object>(snapshot: firebase.firestore.QueryDocumentSnapshot<T>): T {
        const data = snapshot.data()
        return convertTimestamps(data)
    },

    toFirestore<T>(data: T) {
        return data
    },
}
