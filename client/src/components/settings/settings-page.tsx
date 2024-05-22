import { Link, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@ui-components/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { cn } from '@utils/tailwind'

export function SettingsPage() {
    const { pathname } = useLocation()

    console.log(pathname)
    return (
        <main className="twp flex min-h-[calc(100vh-64px)] flex-col px-12 pt-12">
            <div className="space-y-1">
                <h2 className="font-lilita text-3xl">Settings</h2>
                <p className="font-gotham font-bold text-muted-foreground">
                    Manage your account and the users for this studio.
                </p>
            </div>
            <Select>
                <SelectTrigger className="mt-4 w-[180px] md:hidden">
                    <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Separator className="mt-6" />
            <div className="flex h-full grow">
                <aside className="-mx-4 mr-4 mt-6 hidden w-60 md:block">
                    <nav className="flex flex-col">
                        <Link to="account">
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start bg-transparent text-black',
                                    pathname.includes('account')
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
                                    pathname.includes('members')
                                        ? 'bg-muted hover:bg-muted'
                                        : 'hover:bg-transparent hover:underline'
                                )}
                            >
                                Manage Users
                            </Button>
                        </Link>
                    </nav>
                </aside>
                <Separator orientation="vertical" className="fixed left-72 hidden md:block" />
                <div className="ml-0 mt-6 grow md:ml-6">
                    <Outlet />
                </div>
            </div>
        </main>
    )
}
