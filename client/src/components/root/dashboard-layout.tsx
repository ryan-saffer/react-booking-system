import { Link, Outlet } from 'react-router-dom'

import { ClerkLoaded, ClerkLoading, OrganizationSwitcher, UserButton } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import Loader from '@components/Shared/Loader'

export function DashboardLayout() {
    return (
        <main className="flex h-full flex-col">
            <nav
                id="navbar"
                className="twp z-50 flex h-16 w-full flex-none items-center justify-center bg-slate-900 shadow-md"
            >
                <Link to="/dashboard" preventScrollReset={true} className="absolute left-4 sm:static">
                    <img src="/fizz-logo.png" className=" h-12" />
                </Link>
                <div className="absolute right-4">
                    <div className="flex h-full items-center justify-center gap-4">
                        <OrganizationSwitcher hidePersonal appearance={{ baseTheme: dark }} />
                        <UserButton afterSignOutUrl="/sign-in" />
                    </div>
                </div>
            </nav>
            <ClerkLoading>
                <Loader />
            </ClerkLoading>
            <ClerkLoaded>
                <section className="flex-auto">
                    <Outlet />
                </section>
            </ClerkLoaded>
        </main>
    )
}
