import '/fonts/LilitaOne-Regular.ttf'
import '/fonts/Gotham-Light.otf'

import { ConfigProvider, ThemeConfig } from 'antd'
import { getCloudFunctionsDomain, getFunctionEmulatorDomain } from 'fizz-kidz'
import { useState } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { useEmulators } from '@components/Firebase/firebase.js'
import useFirebase from '@components/Hooks/context/UseFirebase.js'
import { AuthProvider } from '@components/Session/auth-provider.js'
import { ProtectedRoute } from '@components/Session/protected-route.js'
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
            const { Navigation } = await import('../Navigation/navigation.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={[]}>
                        <Navigation />
                    </ProtectedRoute>
                ),
            }
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
        path: ROUTES.AFTER_SCHOOL_PROGRAM_SELECT_CLASS,
        lazy: async () => {
            const { AfterSchoolProgramCheckinClassSelection } = await import(
                '../after-school-program/Checkin/SelectClass/index.js'
            )
            return {
                Component: () => (
                    <ProtectedRoute roles={['BASIC']}>
                        <AfterSchoolProgramCheckinClassSelection />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_CLASS_DETAILS,
        lazy: async () => {
            const { AfterSchoolProgramCheckinClassDetails } = await import(
                '../after-school-program/Checkin/ClassDetails/index.js'
            )
            return {
                Component: () => (
                    <ProtectedRoute roles={['BASIC']}>
                        <AfterSchoolProgramCheckinClassDetails />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_INVOICING_SELECT_CLASS,
        lazy: async () => {
            const { AfterSchoolProgramInvoicingClassSelection } = await import(
                '../after-school-program/Invoicing/SelectClass/index.js'
            )
            return {
                Component: () => (
                    <ProtectedRoute roles={['ADMIN']}>
                        <AfterSchoolProgramInvoicingClassSelection />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_INVOICING_STATUS,
        lazy: async () => {
            const { AfterSchoolProgramInvoicing } = await import(
                '../after-school-program/Invoicing/InvoiceStatusPage/index.js'
            )
            return {
                Component: () => (
                    <ProtectedRoute roles={['ADMIN']}>
                        <AfterSchoolProgramInvoicing />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS,
        lazy: async () => {
            const { HolidayProgramSelection } = await import('../HolidayPrograms/SelectClass/index.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={['BASIC']}>
                        <HolidayProgramSelection />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS,
        lazy: async () => {
            const { ClassDetailsPage } = await import('../HolidayPrograms/ClassDetails/index.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={['BASIC']}>
                        <ClassDetailsPage />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.BOOKINGS,
        lazy: async () => {
            const { BookingsPage } = await import('../Bookings/bookings-page.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={['BASIC', 'RESTRICTED']}>
                        <BookingsPage />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_ENROLMENT,
        lazy: async () => {
            const { EnrolmentPage: Component } = await import('../after-school-program/Enrolment/index.js')
            return { Component }
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_PARENT_PORTAL,
        lazy: async () => {
            const { ParentPortalRoot: Component } = await import('../after-school-program/ParentPortal/index.js')
            return { Component }
        },
    },
    // redirect to new portal link. can be deleted after term 1 2024.
    {
        path: '/science-program-portal/:id',
        Component: () => {
            const path = window.location.pathname
            const newPath = ROUTES.AFTER_SCHOOL_PROGRAM_PARENT_PORTAL
            const id = path.substring(path.lastIndexOf('/') + 1)
            return <Navigate to={`${newPath.substring(0, newPath.length - 4)}/${id}`} replace />
        },
    },
    {
        path: ROUTES.AFTER_SCHOOL_PROGRAM_ENROLMENT_FORM,
        lazy: async () => {
            const { BookingForm: Component } = await import('../after-school-program/booking-form/index.js')
            return { Component }
        },
    },
    // redirect to new enrolment form url. can be deleted once website updated.
    {
        path: '/science-program-booking-form',
        element: <Navigate to={ROUTES.AFTER_SCHOOL_PROGRAM_ENROLMENT_FORM} replace />,
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
            return {
                Component: () => (
                    <ProtectedRoute roles={['BOOKKEEPER']}>
                        <Payroll />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.ONBOARDING,
        lazy: async () => {
            const { Onboarding } = await import('../Onboarding/Onboarding.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={[]}>
                        <Onboarding />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.CREATIONS,
        lazy: async () => {
            const { CreationsPage } = await import('../Creations/Creations.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={[]}>
                        <CreationsPage />
                    </ProtectedRoute>
                ),
            }
        },
    },
    {
        path: ROUTES.INVITATIONS,
        lazy: async () => {
            const { CreateInvitationPage } = await import('../invitations/invitations-page.js')
            return { Component: CreateInvitationPage }
        },
    },
    {
        path: ROUTES.INVITATION_CREATE,
        lazy: async () => {
            const { CreateInvitationPage: InvitationV2 } = await import('../invitations/create-invitation-page.js')
            return { Component: InvitationV2 }
        },
    },
    {
        path: ROUTES.INVITATION_VIEW,
        lazy: async () => {
            const { ViewInvitationPage } = await import('../invitations/view-invitation-page.js')
            return { Component: ViewInvitationPage }
        },
    },
    {
        path: ROUTES.DISCOUNT_CODES,
        lazy: async () => {
            const { DiscountCodesPage } = await import('../discount-codes/discount-codes-page.js')
            return {
                Component: () => (
                    <ProtectedRoute roles={['ADMIN']}>
                        <DiscountCodesPage />
                    </ProtectedRoute>
                ),
            }
        },
    },
])

export const App = () => {
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
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <ConfigProvider theme={antdTheme}>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <trpc.Provider client={trpcClient} queryClient={queryClient}>
                            <QueryClientProvider client={queryClient}>
                                <AuthProvider>
                                    <RouterProvider router={router} />
                                </AuthProvider>
                            </QueryClientProvider>
                        </trpc.Provider>
                    </LocalizationProvider>
                </ConfigProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}
