import { Link, Outlet } from 'react-router-dom'

import { SidebarProvider, SidebarTrigger, useSidebar } from '@ui-components/sidebar'
import { cn } from '@utils/tailwind'

import { DashboardSidebar } from './dashboard-sidebar'
import { OrganisationSwitcher } from './organisation-switcher'

export function DashboardLayout() {
    return (
        <SidebarProvider defaultOpen={false} className="h-full min-h-0 flex-col">
            <DashboardSidebar />
            <DashboardContentShell />
        </SidebarProvider>
    )
}

function DashboardContentShell() {
    const { isMobile, open } = useSidebar()

    return (
        <div
            className={cn('flex h-full min-h-0 flex-col transition-[padding-left] duration-200 ease-linear', {
                'pl-[var(--sidebar-width)]': open && !isMobile,
            })}
        >
            <nav
                id="navbar"
                className="twp relative z-50 flex h-16 w-full flex-none items-center justify-center bg-slate-900 shadow-md"
            >
                <SidebarTrigger
                    className="absolute left-4 h-9 w-9 p-2 text-white hover:bg-slate-800 hover:text-white [&>svg]:h-5 [&>svg]:w-5"
                    aria-label="Toggle dashboard navigation"
                />
                <Link to="/dashboard" preventScrollReset={true} className="hidden cursor-pointer sm:block">
                    <img src="/fizz-logo.png" className=" h-12" />
                </Link>
                <div className="absolute right-4 pr-4">
                    <div className="flex h-full items-center justify-center gap-4">
                        <OrganisationSwitcher />
                    </div>
                </div>
            </nav>
            <section className="min-h-0 flex-auto overflow-auto">
                <div className="min-h-0 flex-auto overflow-auto">
                    <Outlet />
                </div>
            </section>
        </div>
    )
}
