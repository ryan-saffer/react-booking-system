import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vite-plus'

import fmtConfig from './oxfmt.config'

const workspaceDir = process.cwd()
const clientDir = path.join(workspaceDir, 'apps/client')
const serverDir = path.join(workspaceDir, 'apps/server')
const coreDir = path.join(workspaceDir, 'packages/core')
const vpBin = path.join(workspaceDir, 'node_modules', 'vite-plus', 'bin', 'vp')
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processCleanups = new Set<() => void>()
let processCleanupRegistered = false

const clientAliases = {
    '@components': path.join(clientDir, 'src/components'),
    '@ui-components': path.join(clientDir, 'src/ui-components/ui'),
    '@constants': path.join(clientDir, 'src/constants'),
    '@drawables': path.join(clientDir, 'src/drawables'),
    '@utils': path.join(clientDir, 'src/utilities'),
    '@hooks': path.join(clientDir, 'src/components/Hooks'),
    '@fizz-kidz/core': path.join(coreDir, 'src'),
}

const serverAliases = {
    '@': path.join(serverDir, 'src'),
    '@fizz-kidz/core': path.join(coreDir, 'src'),
}

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
        const gitSha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
            cwd: workspaceDir,
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim()
        if (gitSha) {
            return { version: gitSha, builtAt }
        }
    } catch {
        // A source archive does not necessarily contain Git metadata.
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

function runVp(args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env) {
    execFileSync(process.execPath, [vpBin, ...args], { cwd, env, stdio: 'inherit' })
}

function resolveParentPids() {
    const parentPids = [process.ppid]
    if (process.platform === 'win32') {
        return parentPids
    }

    try {
        const grandparentPid = Number(
            execFileSync('ps', ['-o', 'ppid=', '-p', String(process.ppid)], { encoding: 'utf8' }).trim()
        )
        if (grandparentPid > 1) {
            parentPids.push(grandparentPid)
        }
    } catch {
        // The immediate parent is still enough for direct Vite+ execution.
    }

    return parentPids
}

function registerProcessCleanup(cleanup: () => void) {
    processCleanups.add(cleanup)
    if (processCleanupRegistered) {
        return
    }

    processCleanupRegistered = true
    const runCleanups = () => {
        for (const processCleanup of processCleanups) {
            try {
                processCleanup()
            } catch (error) {
                console.error('Failed to stop a development process.', error)
            }
        }
    }

    process.once('SIGINT', () => {
        runCleanups()
        process.exit(130)
    })
    process.once('SIGTERM', () => {
        runCleanups()
        process.exit(143)
    })
    process.once('exit', runCleanups)

    const parentPids = resolveParentPids()
    const parentWatcher = setInterval(() => {
        for (const parentPid of parentPids) {
            try {
                process.kill(parentPid, 0)
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code === 'ESRCH') {
                    runCleanups()
                    process.exit(143)
                }
            }
        }
    }, 500)
    parentWatcher.unref()
    process.once('exit', () => clearInterval(parentWatcher))
}

function workspaceBuildPlugin(): Plugin {
    return {
        name: 'workspace-build',
        apply: 'build',
        buildStart() {
            if (process.env.VP_SKIP_SERVER_BUILD === 'true') {
                return
            }

            runVp(['pack'], coreDir)
            runVp(['pack'], serverDir)
        },
    }
}

function stopChild(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') {
    if (!child.pid || child.killed || child.exitCode !== null) {
        return
    }

    try {
        if (process.platform === 'win32') {
            child.kill(signal)
        } else {
            process.kill(-child.pid, signal)
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
            throw error
        }
    }
}

function typeCheckWatchPlugin(): Plugin {
    let children: ChildProcess[] = []

    return {
        name: 'typescript-watch',
        apply: 'serve',
        configureServer(viteServer) {
            const projects = [path.join(clientDir, 'tsconfig.json')]

            children = projects.map((project) =>
                spawn(
                    process.execPath,
                    [vpBin, 'exec', 'tsc', '--noEmit', '--watch', '--preserveWatchOutput', '-p', project],
                    {
                        cwd: workspaceDir,
                        detached: process.platform !== 'win32',
                        stdio: 'inherit',
                    }
                )
            )

            const stop = () => {
                for (const child of children) {
                    // The native TypeScript watcher can finish a long compilation after SIGTERM and write into the terminal.
                    stopChild(child, 'SIGKILL')
                }
                children = []
            }

            registerProcessCleanup(stop)
            viteServer.httpServer?.once('close', stop)
        },
    }
}

function firebaseEmulatorPlugin(): Plugin {
    let children: ChildProcess[] = []

    return {
        name: 'firebase-emulators',
        apply: 'serve',
        configureServer(viteServer) {
            if (process.env.VP_CLIENT_ONLY === 'true') {
                return
            }

            children = [
                spawn(npmBin, ['run', 'server'], {
                    cwd: workspaceDir,
                    detached: process.platform !== 'win32',
                    stdio: 'inherit',
                }),
            ]

            const stop = () => {
                for (const child of children) {
                    stopChild(child)
                }
                children = []
            }

            registerProcessCleanup(stop)
            viteServer.httpServer?.once('close', stop)
        },
    }
}

export default defineConfig(({ command, mode }) => {
    const envMode = mode === 'production' ? 'prod' : mode === 'development' ? 'dev' : mode
    const env = loadEnv(envMode, clientDir, '')
    const { version, builtAt } = resolveAppVersion(env)
    const functionsApiTarget = `http://127.0.0.1:5001/${env.VITE_FIREBASE_PROJECT_ID}/australia-southeast1/api`
    const envDefinitions = Object.fromEntries(
        Object.entries(env)
            .filter(([key]) => key.startsWith('VITE_'))
            .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
    )

    return {
        root: clientDir,
        envDir: clientDir,
        define: {
            ...envDefinitions,
            'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
            'import.meta.env.VITE_APP_BUILT_AT': JSON.stringify(builtAt),
        },
        server: {
            port: 3000,
            proxy: {
                '/api': { target: functionsApiTarget, changeOrigin: true },
                '/forms': { target: functionsApiTarget, changeOrigin: true },
            },
        },
        resolve: { alias: clientAliases },
        build: {
            outDir: path.join(clientDir, 'dist'),
            sourcemap: true,
            rollupOptions: {
                input: {
                    index: path.join(clientDir, 'index.html'),
                    invitation: path.join(clientDir, 'invitation.html'),
                },
            },
        },
        plugins: [
            react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
            appVersionJsonPlugin(version, builtAt),
            mode === 'test' ? undefined : workspaceBuildPlugin(),
            mode === 'test' ? undefined : typeCheckWatchPlugin(),
            mode === 'test' ? undefined : firebaseEmulatorPlugin(),
            command === 'build' &&
            env.FUNCTIONS_EMULATOR !== 'true' &&
            process.env.FUNCTIONS_EMULATOR !== 'true' &&
            env.SENTRY_AUTH_TOKEN
                ? sentryVitePlugin({
                      org: 'fizz-kidz',
                      project: 'client',
                      authToken: env.SENTRY_AUTH_TOKEN,
                      sourcemaps: { filesToDeleteAfterUpload: ['./apps/client/dist/**/*.map'] },
                  })
                : undefined,
        ],
        test: {
            coverage: { reporter: ['text', 'html'] },
            projects: [
                {
                    extends: true,
                    test: {
                        name: 'client',
                        root: clientDir,
                        include: ['src/**/*.test.{ts,tsx,js,jsx}'],
                    },
                },
                {
                    resolve: { alias: serverAliases },
                    test: {
                        name: 'server',
                        root: serverDir,
                        include: ['src/**/*.test.ts'],
                    },
                },
            ],
        },
        lint: {
            plugins: ['typescript'],
            categories: { correctness: 'error' },
            ignorePatterns: [
                'apps/client/dist/**',
                'apps/client/coverage/**',
                'apps/server/lib/**',
                'apps/server/coverage/**',
                'apps/website/dist/**',
                'apps/website/.astro/**',
                'packages/core/lib/**',
                'packages/core/lib-tsc/**',
            ],
            options: {
                reportUnusedDisableDirectives: 'error',
                typeAware: true,
                typeCheck: true,
            },
            rules: {
                'no-duplicate-imports': 'off',
                'typescript/ban-ts-comment': 'error',
                'typescript/consistent-type-imports': [
                    'error',
                    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
                ],
                'typescript/no-empty-object-type': 'off',
                'typescript/no-explicit-any': 'off',
                'typescript/await-thenable': 'off',
                'typescript/no-base-to-string': 'off',
                'typescript/no-floating-promises': 'off',
                'typescript/no-misused-spread': 'off',
                'typescript/no-redundant-type-constituents': 'off',
                'typescript/require-array-sort-compare': 'off',
                'typescript/restrict-template-expressions': 'off',
                'typescript/unbound-method': 'off',
                'typescript/no-unused-vars': ['error', { caughtErrors: 'none' }],
            },
            overrides: [
                {
                    files: ['apps/client/**/*.{js,jsx,ts,tsx}'],
                    plugins: ['typescript', 'react'],
                    env: { browser: true, es2020: true },
                    rules: {
                        'react/exhaustive-deps': 'warn',
                        'react/only-export-components': [
                            'error',
                            {
                                allowConstantExport: true,
                                customHOCs: ['WithConfirmationDialog', 'WithErrorDialog'],
                            },
                        ],
                        'react/rules-of-hooks': 'error',
                    },
                },
                {
                    files: ['apps/website/src/**/*.{js,jsx,ts,tsx}'],
                    plugins: ['typescript', 'react'],
                    env: { browser: true, es2020: true },
                    rules: {
                        'react/exhaustive-deps': 'warn',
                        'react/only-export-components': 'off',
                        'react/rules-of-hooks': 'error',
                    },
                },
                {
                    files: ['apps/website/*.{js,mjs,cjs,ts}', 'apps/website/netlify/**/*.{js,mjs,cjs,ts}'],
                    plugins: ['typescript'],
                    env: { es2020: true, node: true },
                },
                {
                    files: ['apps/server/**/*.{js,mjs,ts}'],
                    plugins: ['typescript'],
                    env: { es2020: true, node: true },
                    rules: {
                        'no-use-before-define': 'off',
                        'typescript/explicit-module-boundary-types': 'off',
                        'typescript/no-non-null-assertion': 'off',
                        'typescript/no-shadow': 'error',
                        'typescript/no-use-before-define': 'off',
                    },
                },
                {
                    files: ['**/*.test.{js,jsx,ts,tsx}'],
                    plugins: ['typescript', 'vitest'],
                    env: { node: true, vitest: true },
                    rules: {
                        'vitest/expect-expect': [
                            'error',
                            {
                                assertFunctionNames: [
                                    'expect',
                                    'strictEqual',
                                    'deepStrictEqual',
                                    'ok',
                                    'rejects',
                                    'throws',
                                ],
                            },
                        ],
                        'vitest/require-mock-type-parameters': 'off',
                    },
                },
                {
                    files: ['apps/client/**/*.test.{jsx,tsx}'],
                    plugins: ['typescript', 'react', 'vitest'],
                    env: { browser: true, vitest: true },
                },
            ],
        },
        fmt: fmtConfig,
        staged: {
            '*.{js,jsx,ts,tsx,json,jsonc,css,html,md,mjml,yaml,yml}': 'vp check --fix --no-error-on-unmatched-pattern',
        },
    }
})
