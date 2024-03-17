import mixpanel from 'mixpanel-browser'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { FirebaseProvider } from '@components/Firebase/firebase-provider'
import { MixpanelContext } from '@components/Mixpanel/MixpanelContext'
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { ConfigProvider, type ThemeConfig } from 'antd'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@utils/trpc'
import { httpLink } from '@trpc/client'
import { useEmulators } from '@components/Firebase/firebase'
import { getCloudFunctionsDomain, getFunctionEmulatorDomain } from 'fizz-kidz'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AuthProvider } from '@components/Session/auth-provider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { ClerkProvider } from '@clerk/clerk-react'
import Meta from 'antd/es/card/Meta'

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

const _Root = () => {
    const firebase = useFirebase()

    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpLink({
                    url: '',
                    async headers() {
                        const authToken = (await firebase.auth.currentUser?.getIdToken()) || ''
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
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <ScrollRestoration />
                <Outlet />
            </QueryClientProvider>
        </trpc.Provider>
    )
}

export function Root() {
    return (
        <FirebaseProvider>
            <MixpanelContext.Provider value={mixpanel}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        <ConfigProvider theme={antdTheme}>
                            <LocalizationProvider dateAdapter={AdapterLuxon}>
                                <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_DEV}>
                                    <AuthProvider>
                                        <_Root />
                                    </AuthProvider>
                                </ClerkProvider>
                            </LocalizationProvider>
                        </ConfigProvider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </MixpanelContext.Provider>
        </FirebaseProvider>
    )
}
