import type { Storage } from 'firebase-admin/storage'
import type { Firestore } from 'firebase-admin/firestore'

import { initializeApp, cert } from 'firebase-admin/app'

export const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
export const projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId

const databaseURL =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'

initializeApp({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    credential: cert(require(`../credentials/${env}_service_account_credentials.json`)),
    databaseURL,
})

let _storage: Storage
export async function getStorage() {
    if (_storage) return _storage
    _storage = (await import('firebase-admin/storage')).getStorage()
    return _storage
}

let _db: Firestore
export async function getDb() {
    if (_db) return _db
    _db = (await import('firebase-admin/firestore')).getFirestore()
    _db.settings({ ignoreUndefinedProperties: true })
    return _db
}
