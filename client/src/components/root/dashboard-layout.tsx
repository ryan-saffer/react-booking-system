import { Link, Outlet } from 'react-router-dom'

import { ClerkLoaded, ClerkLoading, OrganizationList, OrganizationSwitcher, UserButton } from '@clerk/clerk-react'
import Loader from '@components/Shared/Loader'

export function DashboardLayout() {
    return (
        <main className="h-full flex-col">
            <nav id="navbar" className="twp z-50 flex h-16 w-full items-center justify-center bg-slate-900 shadow-md">
                <div className="absolute left-4">
                    <OrganizationSwitcher
                        hidePersonal
                        appearance={{
                            elements: {
                                organizationSwitcherTrigger: {
                                    background: 'white',
                                    padding: 8,
                                    '&:hover': { background: 'white', padding: 8 },
                                },
                            },
                        }}
                    />
                </div>
                <Link to="/dashboard" preventScrollReset={true}>
                    <img src="/fizz-logo.png" className="h-12" />
                </Link>
                <div className="absolute right-4">
                    <UserButton afterSignOutUrl="/sign-in" />
                </div>
            </nav>
            <ClerkLoading>
                <Loader />
            </ClerkLoading>
            <ClerkLoaded>
                <Outlet />
            </ClerkLoaded>
        </main>
    )
}
