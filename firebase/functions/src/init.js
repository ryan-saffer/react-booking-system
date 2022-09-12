// firebase initialisation
const admin = require('firebase-admin')
const environment = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? "prod" : "dev"
const databaseUrl = environment === "prod" ? "https://bookings-prod.firebaseio.com" : "https://booking-system-6435d.firebaseio.com"
admin.initializeApp({
  credential: admin.credential.cert(require(`../credentials/${environment}_service_account_credentials.json`)),
  databaseURL: databaseUrl
})

// import credentials here to force typescript to compile the json files
// see https://stackoverflow.com/a/59419449/7870403
import * as prodConfig from '../credentials/prod_service_account_credentials.json'
import * as devConfig from '../credentials/dev_service_account_credentials.json'

export const storage = admin.storage()
export const db = admin.firestore()
db.settings({ignoreUndefinedProperties: true})