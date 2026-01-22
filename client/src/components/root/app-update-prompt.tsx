import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@ui-components/alert-dialog'

type VersionPayload = {
    version?: string
    builtAt?: string
}

async function fetchLatestVersion(): Promise<VersionPayload | null> {
    try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, {
            cache: 'no-store',
        })

        if (!response.ok) {
            return null
        }

        const payload = (await response.json()) as VersionPayload
        if (!payload || typeof payload.version !== 'string') {
            return null
        }

        return payload
    } catch {
        return null
    }
}

export function AppUpdatePrompt({ pollIntervalMs = 5 * 60_000 }: { pollIntervalMs?: number }) {
    const currentVersion = import.meta.env.VITE_APP_VERSION

    const [latest, setLatest] = useState<VersionPayload | null>(null)
    const [open, setOpen] = useState(false)

    const auth = useAuth()

    const updateAvailable = useMemo(() => {
        return Boolean(latest?.version && latest.version !== currentVersion)
    }, [latest?.version, currentVersion])

    useEffect(() => {
        if (import.meta.env.DEV) {
            return
        }

        let cancelled = false
        let inFlight = false

        const check = async () => {
            if (inFlight) {
                return
            }

            inFlight = true
            try {
                const payload = await fetchLatestVersion()
                if (!payload || cancelled) {
                    return
                }

                setLatest((prev) => (prev?.version === payload.version ? prev : payload))

                if (payload.version !== currentVersion) {
                    setOpen(true)
                }
            } finally {
                inFlight = false
            }
        }

        void check()
        const interval = window.setInterval(check, pollIntervalMs)

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void check()
            }
        }

        document.addEventListener('visibilitychange', onVisibilityChange)
        window.addEventListener('focus', check)

        return () => {
            cancelled = true
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', onVisibilityChange)
            window.removeEventListener('focus', check)
        }
    }, [pollIntervalMs, currentVersion])

    useEffect(() => {
        if (updateAvailable) {
            setOpen(true)
        }
    }, [updateAvailable])

    const handleRefresh = () => {
        const url = new URL(window.location.href)
        url.searchParams.set('v', latest?.version ?? `${Date.now()}`)

        // Replace rather than reload to help bypass any cached HTML on iOS.
        window.location.replace(url.toString())
    }

    if (auth?.accountType === 'customer') {
        return null
    }

    if (!updateAvailable) {
        return null
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="twp max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Update available</AlertDialogTitle>
                    <AlertDialogDescription>
                        A newer version of the portal is available. Refresh to load the latest features and fixes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Not now</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRefresh}>Refresh</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
