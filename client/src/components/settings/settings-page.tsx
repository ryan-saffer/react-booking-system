import { Link, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@ui-components/button'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'

export function SettingsPage() {
    const { pathname } = useLocation()
    return (
        <main className="twp h-full p-12">
            <div className="space-y-1">
                <h2 className="font-lilita text-2xl">Settings</h2>
                <p className="font-gotham font-bold text-muted-foreground">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex">
                <aside className="-mx-4 mr-4 w-60">
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
                                Manage Members
                            </Button>
                        </Link>
                    </nav>
                </aside>
                <div className="grow">
                    <Outlet />
                </div>
            </div>
        </main>
    )
}
