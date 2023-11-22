import { ConfigProvider, ThemeConfig } from 'antd'
import { getCloudFunctionsDomain, getFunctionEmulatorDomain } from 'fizz-kidz'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { useEmulators } from '@components/Firebase/firebase.js'
import useFirebase from '@components/Hooks/context/UseFirebase.js'
import { withAuthentication, withAuthorization } from '@components/Session'
import * as ROUTES from '@constants/routes'
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink } from '@trpc/client'
import { trpc } from '@utils/trpc.js'

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
            const { Navigation } = await import('../Navigation/index.js')
            return { Component: withAuthorization([], Navigation) }
        },
    },
    {
        path: ROUTES.SIGN_IN,
        lazy: async () => {
            const { SignInPage: Component } = await import('../SignIn/index.js')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_SELECT_CLASS,
        lazy: async () => {
            const { ScienceClubCheckinClassSelection } = await import('../ScienceClub/Checkin/SelectClass/index.js')
            return { Component: withAuthorization(['BASIC'], ScienceClubCheckinClassSelection) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_CLASS_DETAILS,
        lazy: async () => {
            const { ScienceClubCheckinClassDetails } = await import('../ScienceClub/Checkin/ClassDetails/index.js')
            return { Component: withAuthorization(['BASIC'], ScienceClubCheckinClassDetails) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS,
        lazy: async () => {
            const { ScienceClubInvoicingClassSelection } = await import('../ScienceClub/Invoicing/SelectClass/index.js')
            return { Component: withAuthorization(['ADMIN'], ScienceClubInvoicingClassSelection) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_INVOICING_STATUS,
        lazy: async () => {
            const { ScienceClassDashboard } = await import('../ScienceClub/Invoicing/InvoiceStatusPage/index.js')
            return { Component: withAuthorization(['ADMIN'], ScienceClassDashboard) }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS,
        lazy: async () => {
            const { HolidayProgramSelection } = await import('../HolidayPrograms/SelectClass/index.js')
            return { Component: withAuthorization(['BASIC'], HolidayProgramSelection) }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS,
        lazy: async () => {
            const { ClassDetailsPage } = await import('../HolidayPrograms/ClassDetails/index.js')
            return { Component: withAuthorization(['BASIC'], ClassDetailsPage) }
        },
    },
    {
        path: ROUTES.BOOKINGS,
        lazy: async () => {
            const { BookingsPage } = await import('../Bookings/Bookings.js')
            return { Component: withAuthorization(['BASIC', 'RESTRICTED'], BookingsPage) }
        },
    },
    {
        path: ROUTES.SCIENCE_CLUB_ENROLMENT,
        lazy: async () => {
            const { EnrolmentPage: Component } = await import('../ScienceClub/Enrolment/index.js')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_PROGRAM_PARENT_PORTAL,
        lazy: async () => {
            const { ParentPortalRoot: Component } = await import('../ScienceClub/ParentPortal/index.js')
            return { Component }
        },
    },
    {
        path: ROUTES.SCIENCE_PROGRAM_BOOKING_FORM,
        lazy: async () => {
            const { BookingForm: Component } = await import('../ScienceClub/BookingForm/index.js')
            return { Component }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CUSTOMER_BOOKING_SCREEN,
        lazy: async () => {
            const { CustomerBookingScreen: Component } = await import(
                '../HolidayPrograms/CustomerBookingScreen/index.js'
            )
            return { Component }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CUSTOMER_CONFIRMATION_SCREEN,
        lazy: async () => {
            const { Confirmation: Component } = await import(
                '../HolidayPrograms/CustomerBookingScreen/confirmation/Confirmation.js'
            )
            return { Component }
        },
    },
    {
        path: ROUTES.PAYROLL,
        lazy: async () => {
            const { Payroll } = await import('../Payroll/Payroll.js')
            return { Component: withAuthorization(['BOOKKEEPER'], Payroll) }
        },
    },
    {
        path: ROUTES.ONBOARDING,
        lazy: async () => {
            const { Onboarding } = await import('../Onboarding/Onboarding.js')
            return { Component: withAuthorization([], Onboarding) }
        },
    },
    {
        path: ROUTES.CREATIONS,
        lazy: async () => {
            const { CreationsPage } = await import('../Creations/Creations.js')
            return { Component: withAuthorization([], CreationsPage) }
        },
    },
])

const _App = () => {
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
                        const normalisedUrl = url.toString().replace(/\./g, '/') // replace '.' with '/'
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
