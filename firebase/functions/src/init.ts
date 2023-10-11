import { initializeApp, cert } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2/options'

export const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
export const projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId

const databaseURL =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'

initializeApp({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    credential: cert(require(`../credentials/${env}_service_account_credentials.json`)),
    databaseURL,
})

setGlobalOptions({ region: 'australia-southeast1' })
