import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import { withAuthentication } from '../Session'
import { ConfigProvider, ThemeConfig } from 'antd'

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
                const { Navigation: Component } = await import('../Navigation')
                return { Component }
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
                const { ScienceClubCheckinClassSelection: Component } = await import(
                    '../ScienceClub/Checkin/SelectClass'
                )
                return { Component }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_CLASS_DETAILS,
            lazy: async () => {
                const { ScienceClubCheckinClassDetails: Component } = await import(
                    '../ScienceClub/Checkin/ClassDetails'
                )
                return { Component }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS,
            lazy: async () => {
                const { ScienceClubInvoicingClassSelection: Component } = await import(
                    '../ScienceClub/Invoicing/SelectClass'
                )
                return { Component }
            },
        },
        {
            path: ROUTES.SCIENCE_CLUB_INVOICING_STATUS,
            lazy: async () => {
                const { ScienceClassDashboard: Component } = await import('../ScienceClub/Invoicing/InvoiceStatusPage')
                return { Component }
            },
        },
        {
            path: ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS,
            lazy: async () => {
                const { HolidayProgramSelection: Component } = await import('../HolidayPrograms/SelectClass')
                return { Component }
            },
        },
        {
            path: ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS,
            lazy: async () => {
                const { ClassDetailsPage: Component } = await import('../HolidayPrograms/ClassDetails')
                return { Component }
            },
        },
        {
            path: ROUTES.BOOKINGS,
            lazy: async () => {
                const { BookingsPage: Component } = await import('../Bookings')
                return { Component }
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
