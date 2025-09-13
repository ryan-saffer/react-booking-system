import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Decide which env file to load inside server/ based on project/environment.
// Priority:
// - prod when FIREBASE_CONFIG.projectId === 'bookings-prod' or GCLOUD_PROJECT === 'bookings-prod'
// - otherwise dev

function isProdProject(): boolean {
  try {
    if (process.env.FIREBASE_CONFIG) {
      const cfg = JSON.parse(process.env.FIREBASE_CONFIG)
      if (cfg?.projectId === 'bookings-prod') return true
    }
  } catch {
    // ignore parse errors
  }
  if (process.env.GCLOUD_PROJECT === 'bookings-prod') return true
  return false
}

(() => {
  const serverDir = path.resolve(__dirname, '..')
  const envFile = isProdProject() ? '.env.prod' : '.env'
  const envPath = path.join(serverDir, envFile)

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
})()

