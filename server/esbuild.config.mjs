import { build } from 'esbuild'
import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin'

await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    packages: 'external',
    supported: { 'dynamic-import': false },
    sourcemap: true,
    outdir: 'lib',
    plugins: [
        sentryEsbuildPlugin({
            // eslint-disable-next-line no-undef
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'fizz-kidz',
            project: 'server',
        }),
    ],
})
