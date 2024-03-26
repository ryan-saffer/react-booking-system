import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

import { OrganizationSwitcher, UserButton, useAuth as useAuthClerk } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'
import { Skeleton } from '@ui-components/skeleton'

import { DashboardDrawer } from './dashboard-drawer'

export function DashboardLayout() {
    const { isLoaded } = useAuthClerk()

    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <main className="flex h-full flex-col">
            <nav
                id="navbar"
                className="twp z-50 flex h-16 w-full flex-none items-center justify-center bg-slate-900 shadow-md"
            >
                <Button
                    className="absolute left-4 flex items-center hover:bg-slate-800"
                    onClick={() => setDrawerOpen((prev) => !prev)}
                >
                    <Menu />
                </Button>
                <Link to="/dashboard" preventScrollReset={true} className="hidden sm:block">
                    <img src="/fizz-logo.png" className=" h-12" />
                </Link>
                <div className="absolute right-4">
                    <div className="flex h-full items-center justify-center gap-4">
                        {isLoaded ? (
                            <>
                                <OrganizationSwitcher
                                    hidePersonal
                                    organizationProfileUrl="/dashboard/organization"
                                    appearance={{
                                        baseTheme: dark,
                                        elements: {
                                            organizationSwitcherPopoverActionButton__manageOrganization: {},
                                        },
                                    }}
                                />
                                <UserButton afterSignOutUrl="/sign-in" />
                            </>
                        ) : (
                            <>
                                <Skeleton className="h-8 w-40 bg-slate-700" />
                                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                            </>
                        )}
                    </div>
                </div>
            </nav>
            {isLoaded ? (
                <>
                    <section className="flex-auto">
                        <Outlet />
                        <DashboardDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
                    </section>
                </>
            ) : (
                <Loader />
            )}
        </main>
    )
}