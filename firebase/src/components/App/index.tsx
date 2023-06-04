import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import { withAuthentication, withAuthorization } from '../Session'
import { ConfigProvider, ThemeConfig } from 'antd'
import { Roles } from '../../constants/roles'

const App = () => {
    const theme = createMuiTheme({
        palette: {
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
                return { Component: withAuthorization([], ScienceClubCheckinClassSelection) }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_CLASS_DETAILS,
            lazy: async () => {
                const { ScienceClubCheckinClassDetails } = await import('../ScienceClub/Checkin/ClassDetails')
                return { Component: withAuthorization([], ScienceClubCheckinClassDetails) }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS,
            lazy: async () => {
                const { ScienceClubInvoicingClassSelection } = await import('../ScienceClub/Invoicing/SelectClass')
                return { Component: withAuthorization([Roles.ADMIN], ScienceClubInvoicingClassSelection) }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_INVOICING_STATUS,
            lazy: async () => {
                const { ScienceClassDashboard } = await import('../ScienceClub/Invoicing/InvoiceStatusPage')
                return { Component: withAuthorization([], ScienceClassDashboard) }
            },
        },
        {
            path: ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS,
            lazy: async () => {
                const { HolidayProgramSelection } = await import('../HolidayPrograms/SelectClass')
                return { Component: withAuthorization([], HolidayProgramSelection) }
            },
        },
        {
            path: ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS,
            lazy: async () => {
                const { ClassDetailsPage } = await import('../HolidayPrograms/ClassDetails')
                return { Component: withAuthorization([], ClassDetailsPage) }
            },
        },
        {
            path: ROUTES.BOOKINGS,
            lazy: async () => {
                const { BookingsPage } = await import('../Bookings')
                return { Component: withAuthorization([], BookingsPage) }
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
                const { Payroll: Component } = await import('../Payroll/Payroll')
                return { Component: withAuthorization([Roles.PAYROLL], Component) }
            },
        },
    ])

    return (
        <ThemeProvider theme={theme}>
            <ConfigProvider theme={antdTheme}>
                <RouterProvider router={router} />
            </ConfigProvider>
        </ThemeProvider>
    )
}

export default withAuthentication(App)
