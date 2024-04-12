import { Link, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@ui-components/button'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'

export function SettingsPage() {
    const { pathname } = useLocation()
    return (
        <main className="twp flex min-h-[calc(100vh-64px)] flex-col px-12 pt-12">
            <div className="space-y-1">
                <h2 className="font-lilita text-3xl">Settings</h2>
                <p className="font-gotham font-bold text-muted-foreground">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>
            <Separator className="mt-6" />
            <div className="flex h-full grow">
                <aside className="-mx-4 mr-4 mt-6 w-60">
                    <nav className="flex flex-col">
                        <Link to="account">
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start bg-transparent text-black',
                                    pathname === '/dashboard/settings/account'
                                        ? 'bg-muted hover:bg-muted'
                                        : 'hover:bg-transparent hover:underline'
                                )}
                            >
                                Account
                            </Button>
                        </Link>
                        <Link to="members">
                            <Button
                                className={cn(
                                    'w-full justify-start bg-transparent text-black',
                                    pathname === '/dashboard/settings/members'
                                        ? 'bg-muted hover:bg-muted'
                                        : 'hover:bg-transparent hover:underline'
                                )}
                            >
                                Manage Users
                            </Button>
                        </Link>
                    </nav>
                </aside>
                {/* 196px is for desktop: 64px navbar + 132px (distance between top of separater and navbar)  */}
                <Separator orientation="vertical" className="h-[calc(100vh-196px)]" />
                <div className="ml-6 mt-6 grow">
                    <Outlet />
                </div>
            </div>
        </main>
    )
}
