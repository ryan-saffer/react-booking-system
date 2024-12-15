import mixpanel from 'mixpanel-browser'
import { Outlet, ScrollRestoration } from 'react-router'

import { FirebaseProvider } from '@components/Firebase/firebase-provider'
import { MixpanelContext } from '@components/Mixpanel/MixpanelContext'
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { ConfigProvider, type ThemeConfig } from 'antd'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@utils/trpc'
import { httpLink } from '@trpc/client'
import { useEmulators } from '@components/Firebase/firebase'
import { getCloudFunctionsDomain, getFunctionEmulatorDomain } from 'fizz-kidz'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AuthProvider } from '@components/Session/auth-provider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { Toaster } from 'sonner'
import { OrgProvider } from '@components/Session/org-provider'
import { ConfirmationDialogProvider } from '@components/Hooks/confirmation-dialog.tsx/confirmation-dialog-provider'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { ConfirmationDialogWithCheckboxProvider } from '@components/Hooks/confirmation-dialog-with-checkbox.tsx/confirmation-dialog-with-checkbox-provider'

mixpanel.init(
    import.meta.env.VITE_ENV === 'prod'
        ? import.meta.env.VITE_MIXPANEL_API_KEY_PROD
        : import.meta.env.VITE_MIXPANEL_API_KEY_DEV,
    { debug: import.meta.env.VITE_ENV === 'dev' }
)

const theme = createTheme({
    palette: {
        background: {
            default: '#fafafa',
        },
        primary: {
            light: '#515051',
            main: '#02152A',
            dark: '#000000',
            contrastText: '#ffffff',
        },
        secondary: {
            light: '#e576c3',
            main: '#B14592',
            dark: '#7f0c64',
            contrastText: '#FFFFFF',
        },
    },
})

const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#B14592',
        fontSize: 16,
    },
}

function _Root() {
    const firebase = useFirebase()

    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpLink({
                    url: '',
                    async headers() {
                        // first try refresh the users token - this means when returning to the app
                        // after a while, it will refresh the token and work nicely.
                        let authToken = (await firebase.auth.currentUser?.getIdToken()) || ''
                        if (!authToken) {
                            // however when refreshing the page, firebase.auth.currentUser is undefined, and we cannot access the AuthUserContext in here.
                            // to get around this, check the cache for the jwt, and use it if it is there.
                            // since this code is only reached during a full page refresh (or user is not logged in),
                            // if the token is expired, onAuthStateChanged should be triggered and on the second attempt firebase.auth.currentUser should be found.
                            const cachedAuthUser = localStorage.getItem('authUser')
                            if (cachedAuthUser) {
                                const authUser = JSON.parse(cachedAuthUser)
                                authToken = authUser.jwt
                            }
                        }
                        return {
                            authorization: authToken,
                        }
                    },
                    fetch(url, options) {
                        const normalisedUrl = url.toString().replace('.', '/') // replace first '.' with '/'
                        const splitUrl = normalisedUrl.split('/')
                        const [router, procedure] = [splitUrl[1], splitUrl[2]]
                        const domain = useEmulators
                            ? getFunctionEmulatorDomain(import.meta.env.VITE_ENV)
                            : getCloudFunctionsDomain(import.meta.env.VITE_ENV)
                        return fetch(`${domain}/${router}/${procedure}`, options)
                    },
                }),
            ],
        })
    )

    return (
        <MixpanelContext.Provider value={mixpanel}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <ConfigProvider theme={antdTheme}>
                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                                <QueryClientProvider client={queryClient}>
                                    <AuthProvider>
                                        <OrgProvider>
                                            <ConfirmationDialogProvider>
                                                <ConfirmationDialogWithCheckboxProvider>
                                                    <ScrollRestoration />
                                                    <Toaster richColors />
                                                    <Outlet />
                                                </ConfirmationDialogWithCheckboxProvider>
                                            </ConfirmationDialogProvider>
                                        </OrgProvider>
                                    </AuthProvider>
                                </QueryClientProvider>
                            </trpc.Provider>
                        </LocalizationProvider>
                    </ConfigProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </MixpanelContext.Provider>
    )
}

export function Root() {
    return (
        <FirebaseProvider>
            <_Root />
        </FirebaseProvider>
    )
}
