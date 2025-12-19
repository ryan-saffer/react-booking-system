import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        server: {
            port: 3000,
        },
        resolve: {
            alias: {
                '@components': path.resolve(__dirname, './src/components'),
                '@ui-components': path.resolve(__dirname, './src/ui-components/ui'),
                '@constants': path.resolve(__dirname, './src/constants'),
                '@drawables': path.resolve(__dirname, './src/drawables'),
                '@utils': path.resolve(__dirname, './src/utilities'),
            },
        },
        build: {
            // Needed so Sentry can find and upload source maps during the build.
            sourcemap: true,
        },
        plugins: [
            react(),
            createHtmlPlugin({
                pages: [
                    { entry: '/src/index.tsx', filename: 'index.html', template: 'public/index.html' },
                    { entry: '/src/index.tsx', filename: 'invitation.html', template: 'public/invitation.html' },
                ],
            }),
            // Put the Sentry Vite plugin after all other plugins
            sentryVitePlugin({
                org: 'fizz-kidz',
                project: 'client',
                authToken: env.SENTRY_AUTH_TOKEN,
                sourcemaps: {
                    // As you're enabling client source maps, you probably want to delete them after they're uploaded to Sentry.
                    // Set the appropriate glob pattern for your output folder - some glob examples below:
                    filesToDeleteAfterUpload: ['./**/*.map', '.*/**/public/**/*.map', './dist/**/client/**/*.map'],
                },
            }),
        ],
    }
})
