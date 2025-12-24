/* eslint-disable no-undef */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { build, context } from 'esbuild'
import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin'

function isProdProject() {
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

const serverDir = path.dirname(fileURLToPath(import.meta.url))
const envFile = isProdProject() ? '.env.prod' : '.env'
const envPath = path.join(serverDir, envFile)

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
}

const isWatch = process.argv.includes('--watch')

const plugins = isWatch
    ? []
    : [
          sentryEsbuildPlugin({
              // eslint-disable-next-line no-undef
              authToken: process.env.SENTRY_AUTH_TOKEN,
              org: 'fizz-kidz',
              project: 'server',
          }),
      ]

const buildOptions = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    packages: 'external',
    supported: { 'dynamic-import': false },
    sourcemap: true,
    outdir: 'lib',
    plugins,
}

if (isWatch) {
    const ctx = await context(buildOptions)
    await ctx.watch()
} else {
    await build(buildOptions)
}
