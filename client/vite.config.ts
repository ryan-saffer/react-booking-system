import { execSync } from 'node:child_process'
import path from 'path'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'

function resolveAppVersion(env: Record<string, string>) {
    const builtAt = new Date().toISOString()

    const explicitVersion = env.VITE_APP_VERSION || process.env.VITE_APP_VERSION
    if (explicitVersion) {
        return { version: explicitVersion, builtAt }
    }

    const ciSha = process.env.GITHUB_SHA

    if (ciSha) {
        return { version: ciSha.slice(0, 7), builtAt }
    }

    try {
        const gitSha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim()
        if (gitSha) {
            return { version: gitSha, builtAt }
        }
    } catch {
        // ignore - not running in a git checkout
    }

    return { version: builtAt, builtAt }
}

function appVersionJsonPlugin(version: string, builtAt: string): Plugin {
    return {
        name: 'app-version-json',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'version.json',
                source: JSON.stringify({ version, builtAt }, null, 2),
            })
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const { version, builtAt } = resolveAppVersion(env)

    return {
        define: {
            'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
            'import.meta.env.VITE_APP_BUILT_AT': JSON.stringify(builtAt),
        },
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
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            createHtmlPlugin({
                pages: [
                    { entry: '/src/index.tsx', filename: 'index.html', template: 'public/index.html' },
                    { entry: '/src/index.tsx', filename: 'invitation.html', template: 'public/invitation.html' },
                ],
            }),
            appVersionJsonPlugin(version, builtAt),
            // Put the Sentry Vite plugin after all other plugins
            env.FUNCTIONS_EMULATPR !== 'true' &&
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
