import '/fonts/LilitaOne-Regular.ttf'
import '/fonts/Gotham-Light.otf'

import { Suspense, lazy } from 'react'
import { Navigate, RouterProvider, createBrowserRouter, useSearchParams } from 'react-router'

import { ProtectedRoute } from '@components/Session/protected-route.js'
import { SignedIn } from '@components/Session/signed-in.js'
import { SignedOut } from '@components/Session/signed-out.js'
import Loader from '@components/Shared/Loader.js'
import { _404 } from '@components/root/404.js'
import { DashboardLayout } from '@components/root/dashboard-layout.js'
import { Root } from '@components/root/root.js'

/**
 * Lazy load all pages. This enables much cleaner code splitting, particularly for parents booking in
 * a program that do not need all the javascript for the entire dashboard.
 */
const SignInPage = lazy(() =>
    import('./components/SignIn/sign-in-page.js').then((module) => ({ default: module.SignInPage }))
)
const SignUpPage = lazy(() =>
    import('./components/SignIn/sign-up-page.js').then((module) => ({ default: module.SignUpPage }))
)
const ResetPasswordPage = lazy(() =>
    import('./components/SignIn/reset-password-page.js').then((module) => ({ default: module.ResetPasswordPage }))
)
const Navigation = lazy(() =>
    import('./components/Navigation/navigation.js').then((module) => ({ default: module.Navigation }))
)
const BookingsPage = lazy(() =>
    import('./components/Bookings/bookings-page.js').then((module) => ({ default: module.BookingsPage }))
)
const SelectClassPage = lazy(() =>
    import('./components/after-school-program/Checkin/select-class-page.js').then((module) => ({
        default: module.SelectClassPage,
    }))
)
const AfterSchoolProgramCheckinClassDetails = lazy(() =>
    import('./components/after-school-program/Checkin/ClassDetails/index.js').then((module) => ({
        default: module.AfterSchoolProgramCheckinClassDetails,
    }))
)
const AfterSchoolProgramInvoicingPage = lazy(() =>
    import('./components/after-school-program/Invoicing/after-school-program-invoicing-page.js').then((module) => ({
        default: module.AfterSchoolProgramInvoicingPage,
    }))
)
const AfterSchoolProgramInvoicing = lazy(() =>
    import('./components/after-school-program/Invoicing/InvoiceStatusPage/index.js').then((module) => ({
        default: module.AfterSchoolProgramInvoicing,
    }))
)
const HolidayProgramSelectionPage = lazy(() =>
    import('./components/HolidayPrograms/holiday-program-class-selection-page.js').then((module) => ({
        default: module.HolidayProgramSelectionPage,
    }))
)
const ClassDetailsPage = lazy(() =>
    import('./components/HolidayPrograms/ClassDetails/index.js').then((module) => ({
        default: module.ClassDetailsPage,
    }))
)
const Payroll = lazy(() => import('./components/Payroll/Payroll.js').then((module) => ({ default: module.Payroll })))
const EnrolmentPage = lazy(() =>
    import('./components/after-school-program/Enrolment/index.js').then((module) => ({ default: module.EnrolmentPage }))
)
const ParentPortalRoot = lazy(() =>
    import('./components/after-school-program/ParentPortal/index.js').then((module) => ({
        default: module.ParentPortalRoot,
    }))
)
const AfterSchoolProgramEnrolmentPage = lazy(() =>
    import('./components/after-school-program/enrolment-form/after-school-program-enrolment-page.js').then(
        (module) => ({ default: module.AfterSchoolProgramEnrolmentPage })
    )
)
const SelectedProgramProvider = lazy(() =>
    import('./components/after-school-program/enrolment-form/selected-program-context.js').then((module) => ({
        default: module.SelectedProgramProvider,
    }))
)
const CustomerBookingScreen = lazy(() =>
    import('./components/HolidayPrograms/CustomerBookingScreen/index.js').then((module) => ({
        default: module.CustomerBookingScreen,
    }))
)
const Confirmation = lazy(() =>
    import('./components/HolidayPrograms/CustomerBookingScreen/confirmation/Confirmation.js').then((module) => ({
        default: module.Confirmation,
    }))
)
const Onboarding = lazy(() =>
    import('./components/Onboarding/Onboarding.js').then((module) => ({ default: module.Onboarding }))
)
const CreationsPage = lazy(() =>
    import('./components/Creations/Creations.js').then((module) => ({ default: module.CreationsPage }))
)
const ChooseInvitationPage = lazy(() =>
    import('./components/invitations/choose-invitation-page.js').then((module) => ({
        default: module.ChooseInvitationPage,
    }))
)
const CreateInvitationPage = lazy(() =>
    import('./components/invitations/create-invitation-page.js').then((module) => ({
        default: module.CreateInvitationPage,
    }))
)
const ViewInvitationPage = lazy(() =>
    import('./components/invitations/view-invitation-page.js').then((module) => ({
        default: module.ViewInvitationPage,
    }))
)
const DiscountCodesPage = lazy(() =>
    import('./components/discount-codes/discount-codes-page.js').then((module) => ({
        default: module.DiscountCodesPage,
    }))
)
const SettingsPage = lazy(() =>
    import('./components/settings/settings-page.js').then((module) => ({ default: module.SettingsPage }))
)
const Account = lazy(() => import('./components/settings/account.js').then((module) => ({ default: module.Account })))
const ManageUsersTable = lazy(() =>
    import('./components/settings/manage-users-table.js').then((module) => ({ default: module.ManageUsersTable }))
)

const router = createBrowserRouter([
    {
        path: '/',
        Component: Root,
        ErrorBoundary: _404,
        children: [
            {
                // redirects the base route to the dashboard, or the sign in page if not logged in
                index: true,
                Component: () => (
                    // <ProtectedRoute roles={[]}>
                    <Navigate to="dashboard" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: 'sign-in',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <SignedIn>
                            <Navigate to="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInPage />
                        </SignedOut>
                    </Suspense>
                ),
            },
            {
                path: 'sign-up',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <SignedIn>
                            <Navigate to="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignUpPage />
                        </SignedOut>
                    </Suspense>
                ),
            },
            {
                path: 'reset-password',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <SignedIn>
                            <Navigate to="/" />
                        </SignedIn>
                        <SignedOut>
                            <ResetPasswordPage />
                        </SignedOut>
                    </Suspense>
                ),
            },
            {
                path: 'dashboard',
                lazy: async () => {
                    return {
                        Component: DashboardLayout,
                    }
                },
                children: [
                    {
                        index: true,
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="dashboard:view">
                                    <Navigation />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'bookings',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="bookings:read">
                                    <BookingsPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'after-school-program',
                        children: [
                            {
                                index: true,
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="after-school-programs:read">
                                            <SelectClassPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="after-school-programs:read">
                                            <AfterSchoolProgramCheckinClassDetails />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                    {
                        path: 'after-school-program-invoicing',
                        children: [
                            {
                                index: true,
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="admin">
                                            <AfterSchoolProgramInvoicingPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="admin">
                                            <AfterSchoolProgramInvoicing />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                    {
                        path: 'holiday-program',
                        children: [
                            {
                                path: '',
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="bookings:read">
                                            <HolidayProgramSelectionPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ProtectedRoute permission="bookings:read">
                                            <ClassDetailsPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                    {
                        path: 'payroll',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="admin">
                                    <Payroll />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'onboarding',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="admin">
                                    <Onboarding />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'creations',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="creations:read">
                                    <CreationsPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'discount-codes',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="admin">
                                    <DiscountCodesPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'settings',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ProtectedRoute permission="dashboard:view">
                                    <SettingsPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                        children: [
                            {
                                path: '',
                                Component: () => <Navigate to="account" />,
                            },
                            {
                                path: 'account',
                                Component: () => (
                                    <Suspense fallback={<Loader />}>
                                        <Account />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'members',
                                Component: () => (
                                    <Suspense fallback={<Loader fullScreen />}>
                                        <ManageUsersTable />
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                ],
            },
            {
                path: 'after-school-program-enrolment',
                Component: () => (
                    <Suspense fallback={<Loader fullScreen />}>
                        <EnrolmentPage />
                    </Suspense>
                ),
            },
            {
                path: 'parent-portal/:id',
                Component: () => (
                    <Suspense fallback={<Loader fullScreen />}>
                        <ParentPortalRoot />
                    </Suspense>
                ),
            },
            // TEMPORARY FIX FOR REDIRECT - TERM 3 2024 ACCIDENTALLY SENT WRONG LINK
            {
                path: 'science-program-booking-form',
                Component: () => <Navigate to="/after-school-program-enrolment-form" />,
            },
            {
                path: 'after-school-program-enrolment-form',
                Component: () => (
                    <Suspense fallback={<Loader fullScreen />}>
                        <SelectedProgramProvider>
                            <AfterSchoolProgramEnrolmentPage />
                        </SelectedProgramProvider>
                    </Suspense>
                ),
            },
            {
                path: 'holiday-programs',
                children: [
                    {
                        index: true,
                        Component: () => (
                            <Suspense>
                                {/* fallback looks awkward on this screen */}
                                <CustomerBookingScreen />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'confirmation',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <Confirmation />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: 'invitations',
                children: [
                    {
                        path: '',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ChooseInvitationPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'create',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <CreateInvitationPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: 'invitation',
                children: [
                    {
                        path: ':id',
                        Component: () => (
                            <Suspense fallback={<Loader fullScreen />}>
                                <ViewInvitationPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            // This route is pureley for backwards compat for opening bookings links in the calendar made before the dashboard.
            // This can be safely removed in January 2025 (once all existing bookings before the dashboard have passed).
            {
                path: 'bookings',
                Component: () => {
                    const [searchParams] = useSearchParams()
                    const bookingId = searchParams.get('id')

                    const route = bookingId ? `/dashboard/bookings?id=${bookingId}` : '/dashboard/bookings'
                    return <Navigate to={route} />
                },
            },
        ],
    },
])

export const App = () => {
    return <RouterProvider router={router} />
}
