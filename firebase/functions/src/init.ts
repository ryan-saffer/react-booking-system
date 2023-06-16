// FIREBASE
import * as admin from 'firebase-admin'
export const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

const databaseUrl =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'
admin.initializeApp({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    credential: admin.credential.cert(require(`../credentials/${env}_service_account_credentials.json`)),
    databaseURL: databaseUrl,
})
export const storage = admin.storage()
export const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

export const projectName = JSON.parse(process.env.FIREBASE_CONFIG).projectId
