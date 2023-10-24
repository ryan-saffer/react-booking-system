import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { withAuthentication, withAuthorization } from '../Session'
import { ConfigProvider, ThemeConfig } from 'antd'

const theme = createTheme({
    palette: {
        background: {
            default: '#fafafa',
        },
        primary: {
            light: '#515051',
            main: '#292829',
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
            const { ScienceClubCheckinClassSelection } = await import('../ScienceClub/Checkin/SelectClass')
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
            const { ScienceClubInvoicingClassSelection } = await import('../ScienceClub/Invoicing/SelectClass')
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
            const { BookingsPage } = await import('../Bookings')
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
])

const App = () => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <ConfigProvider theme={antdTheme}>
                    <RouterProvider router={router} />
                </ConfigProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default withAuthentication(App)
