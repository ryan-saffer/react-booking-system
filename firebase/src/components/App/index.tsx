import { ConfigProvider, ThemeConfig } from 'antd'
import { getApplicationDomain, getFunctionEmulatorDomain } from 'fizz-kidz'
import { RequestInitEsque } from 'node_modules/@trpc/client/dist/internals/types.js'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { useEmulators } from '@components/Firebase/firebase.js'
import { withAuthentication, withAuthorization } from '@components/Session'
import Test from '@components/Test.js'
import * as ROUTES from '@constants/routes'
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TRPCClientError, httpBatchLink, httpLink } from '@trpc/client'
import { Procedure } from '@trpc/server'
import { Procedures, trpc } from '@utils/trpc.js'

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

const router = createBrowserRouter([
    {
        path: ROUTES.LANDING,
        lazy: async () => {
            const { Navigation } = await import('../Navigation')
            return { Component: withAuthorization([], Navigation) }
        },
    },
    {
        path: ROUTES.SIGN_IN,
        lazy: async () => {
            const { SignInPage: Component } = await import('../SignIn')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_SELECT_CLASS,
        lazy: async () => {
            const { ScienceClubCheckinClassSelection } = await import('../ScienceClub/Checkin/SelectClass/index.jsx')
            return { Component: withAuthorization(['BASIC'], ScienceClubCheckinClassSelection) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_CLASS_DETAILS,
        lazy: async () => {
            const { ScienceClubCheckinClassDetails } = await import('../ScienceClub/Checkin/ClassDetails')
            return { Component: withAuthorization(['BASIC'], ScienceClubCheckinClassDetails) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS,
        lazy: async () => {
            const { ScienceClubInvoicingClassSelection } = await import(
                '../ScienceClub/Invoicing/SelectClass/index.jsx'
            )
            return { Component: withAuthorization(['ADMIN'], ScienceClubInvoicingClassSelection) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_INVOICING_STATUS,
        lazy: async () => {
            const { ScienceClassDashboard } = await import('../ScienceClub/Invoicing/InvoiceStatusPage')
            return { Component: withAuthorization(['ADMIN'], ScienceClassDashboard) }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS,
        lazy: async () => {
            const { HolidayProgramSelection } = await import('../HolidayPrograms/SelectClass')
            return { Component: withAuthorization(['BASIC'], HolidayProgramSelection) }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS,
        lazy: async () => {
            const { ClassDetailsPage } = await import('../HolidayPrograms/ClassDetails')
            return { Component: withAuthorization(['BASIC'], ClassDetailsPage) }
        },
    },
    {
        path: ROUTES.BOOKINGS,
        lazy: async () => {
            const { BookingsPage } = await import('../Bookings/Bookings')
            return { Component: withAuthorization(['BASIC', 'RESTRICTED'], BookingsPage) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_ENROLMENT,
        lazy: async () => {
            const { EnrolmentPage: Component } = await import('../ScienceClub/Enrolment')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_PROGRAM_PARENT_PORTAL,
        lazy: async () => {
            const { ParentPortalRoot: Component } = await import('../ScienceClub/ParentPortal')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_PROGRAM_BOOKING_FORM,
        lazy: async () => {
            const { BookingForm: Component } = await import('../ScienceClub/BookingForm')
            return { Component }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CUSTOMER_BOOKING_SCREEN,
        lazy: async () => {
            const { CustomerBookingScreen: Component } = await import('../HolidayPrograms/CustomerBookingScreen')
            return { Component }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CUSTOMER_CONFIRMATION_SCREEN,
        lazy: async () => {
            const { Confirmation: Component } = await import(
                '../HolidayPrograms/CustomerBookingScreen/confirmation/Confirmation'
            )
            return { Component }
        },
    },
    {
        path: ROUTES.PAYROLL,
        lazy: async () => {
            const { Payroll } = await import('../Payroll/Payroll')
            return { Component: withAuthorization(['BOOKKEEPER'], Payroll) }
        },
    },
    {
        path: ROUTES.ONBOARDING,
        lazy: async () => {
            const { Onboarding } = await import('../Onboarding/Onboarding')
            return { Component: withAuthorization([], Onboarding) }
        },
    },
    {
        path: ROUTES.CREATIONS,
        lazy: async () => {
            const { CreationsPage } = await import('../Creations/Creations')
            return { Component: withAuthorization([], CreationsPage) }
        },
    },
    {
        path: '/test',
        element: <Test />,
    },
])

// const functionsMap: { [key in Procedures]: string } = {
//     firstRouter: 'firstFunction',
//     secondRouter: 'secondFunction',
// }

// function isValidRouter(procedure: string): procedure is Procedures {
//     return procedure in functionsMap
// }

const _App = () => {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpLink({
                    // url: `${getFunctionEmulatorDomain('dev')}/secondFunction`,
                    url: '',
                    headers: {
                        Authorization: '123',
                    },
                    fetch(url, init) {
                        console.log(init)
                        console.log('url before:', url.toString())
                        const normalisedUrl = url.toString().replace(/\./g, '/')
                        console.log('normalised url:', normalisedUrl)
                        const [router, procedure] = [normalisedUrl.split('/')[1], normalisedUrl.split('/')[2]]
                        console.log('router:', router)
                        console.log('procedure:', procedure)
                        // if (!isValidRouter(router)) {
                        //     throw new TRPCClientError(`invalid router: '${router}'`)
                        // }
                        // const firebaseFunction = functionsMap[router]
                        const domain = useEmulators
                            ? getFunctionEmulatorDomain(import.meta.env.VITE_ENV)
                            : getApplicationDomain(import.meta.env.VITE_ENV)
                        return fetch(`${domain}/${router}/${procedure}`, init)
                    },
                }),
                // customLink(),
                // httpBatchLink({
                //     url: useEmulators
                //         ? getFunctionEmulatorDomain(import.meta.env.VITE_ENV)
                //         : getApplicationDomain(import.meta.env.VITE_ENV),
                //     // You can pass any HTTP headers you wish here
                //     async headers() {
                //         return {
                //             authorization: '123',
                //         }
                //     },
                // }),
            ],
        })
    )
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <ConfigProvider theme={antdTheme}>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <trpc.Provider client={trpcClient} queryClient={queryClient}>
                            <QueryClientProvider client={queryClient}>
                                <RouterProvider router={router} />
                            </QueryClientProvider>
                        </trpc.Provider>
                    </LocalizationProvider>
                </ConfigProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export const App = withAuthentication(_App)
