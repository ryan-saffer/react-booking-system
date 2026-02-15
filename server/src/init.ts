import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2/options'

const firebaseConfig = process.env.FIREBASE_CONFIG || `{ "projectId": "booking-system-6435d" }`

export const env = JSON.parse(firebaseConfig).projectId === 'bookings-prod' ? 'prod' : 'dev'
export const projectId = JSON.parse(firebaseConfig).projectId

const databaseURL =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'

const credential = applicationDefault()

initializeApp({ credential, databaseURL })

setGlobalOptions({ region: 'australia-southeast1' })
