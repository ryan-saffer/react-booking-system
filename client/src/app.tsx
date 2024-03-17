import '/fonts/LilitaOne-Regular.ttf'
import '/fonts/Gotham-Light.otf'

import { Suspense, lazy } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { ProtectedRoute } from '@components/Session/protected-route.js'
import Loader from '@components/Shared/Loader.js'
import { DashboardLayout } from '@components/root/dashboard-layout.js'
import { Root } from '@components/root/root.js'

/**
 * Lazy load all pages. This enables much cleaner code splitting, particularly for parents booking in
 * a program that do not need all the javascript for the entire dashboard.
 */
const SignInPage = lazy(() => import('./components/SignIn/index.js').then((module) => ({ default: module.SignInPage })))
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
const BookingForm = lazy(() =>
    import('./components/after-school-program/booking-form/index.js').then((module) => ({
        default: module.BookingForm,
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

const router = createBrowserRouter([
    {
        path: '/',
        Component: Root,
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
                            <SignIn />
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
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={[]}>
                                    <Navigation />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'bookings',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={['BASIC', 'RESTRICTED']}>
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
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['BASIC']}>
                                            <SelectClassPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['BASIC']}>
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
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['ADMIN']}>
                                            <AfterSchoolProgramInvoicingPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['ADMIN']}>
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
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['BASIC']}>
                                            <HolidayProgramSelectionPage />
                                        </ProtectedRoute>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'class',
                                Component: () => (
                                    <Suspense fallback={<Loader />}>
                                        <ProtectedRoute roles={['BASIC']}>
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
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={['BOOKKEEPER']}>
                                    <Payroll />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'onboarding',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={[]}>
                                    <Onboarding />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'creations',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={[]}>
                                    <CreationsPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: 'discount-codes',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <ProtectedRoute roles={['ADMIN']}>
                                    <DiscountCodesPage />
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: 'after-school-program-enrolment',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <EnrolmentPage />
                    </Suspense>
                ),
            },
            {
                path: 'parent-portal/:id',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <ParentPortalRoot />
                    </Suspense>
                ),
            },
            {
                path: 'after-school-program-enrolment-form',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <BookingForm />
                    </Suspense>
                ),
            },
            {
                path: 'holiday-programs',
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
                    <Suspense fallback={<Loader />}>
                        <Confirmation />
                    </Suspense>
                ),
            },
            {
                path: 'invitations',
                Component: () => (
                    <Suspense fallback={<Loader />}>
                        <ChooseInvitationPage />
                    </Suspense>
                ),
            },
            {
                path: 'invitation',
                children: [
                    {
                        path: 'create',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <CreateInvitationPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: ':id',
                        Component: () => (
                            <Suspense fallback={<Loader />}>
                                <ViewInvitationPage />
                            </Suspense>
                        ),
                    },
                ],
            },
        ],
    },
])

export const App = () => {
    return <RouterProvider router={router} />
}
