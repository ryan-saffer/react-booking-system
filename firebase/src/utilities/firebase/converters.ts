import firebase from 'firebase/compat/app'

export function convertTimestamps<T extends {}>(input: T): T {
    const data = input as any
    Object.keys(input).forEach((key) => {
        if (data[key] instanceof firebase.firestore.Timestamp) {
            data[key] = data[key].toDate()
        }
    })
    return data
}
