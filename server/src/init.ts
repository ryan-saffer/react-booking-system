import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2/options'

export const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
export const projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId

import devCredentials from '../credentials/dev_service_account_credentials.json'
import prodCredentials from '../credentials/prod_service_account_credentials.json'

const credentials: ServiceAccount =
    env === 'prod'
        ? {
              projectId: prodCredentials.project_id,
              clientEmail: prodCredentials.client_email,
              privateKey: prodCredentials.private_key,
          }
        : {
              projectId: devCredentials.project_id,
              clientEmail: devCredentials.client_email,
              privateKey: devCredentials.private_key,
          }

const databaseURL =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'

initializeApp({
    credential: cert(credentials),
    databaseURL,
})

setGlobalOptions({ region: 'australia-southeast1' })
