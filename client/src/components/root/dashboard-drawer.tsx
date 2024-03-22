import {
    BookOpenText,
    Calendar,
    CreditCard,
    Flag,
    GraduationCap,
    HandCoins,
    PartyPopper,
    TicketPercent,
    Users,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@clerk/clerk-react'
import { useMediaQuery } from '@mui/material'
import { Drawer, DrawerContent } from '@ui-components/drawer'
import { ScrollArea } from '@ui-components/scroll-area'
import { cn } from '@utils/tailwind'

export function DashboardDrawer({
    drawerOpen,
    setDrawerOpen,
}: {
    drawerOpen: boolean
    setDrawerOpen: (state: boolean) => void
}) {
    const { has } = useAuth()
    const isAdmin = has?.({ role: 'org:admin' })
    const canAccessPayroll = has?.({ permission: 'org:payroll:view' })

    const isShort = useMediaQuery('(max-height: 840px')

    return (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="left">
            <DrawerContent
                className="twp top-0 mt-16 h-[calc(100vh-4rem)] w-full rounded-none bg-slate-100 sm:w-[400px]"
                showTopBar={false}
            >
                <ScrollArea className="flex h-full gap-1 p-4">
                    <img
                        src="/backgrounds/bg-fizz-top-right.png"
                        className="absolute right-0 top-0 z-0 w-full max-w-[200px] object-contain"
                    />
                    <img
                        src="/backgrounds/bg-fizz-bottom-left.png"
                        className={cn('absolute bottom-0 left-0 z-0 w-full max-w-[200px] object-contain', {
                            hidden: isShort,
                        })}
                    />
                    <img
                        src="/backgrounds/bg-fizz-bottom-right.png"
                        className={cn('absolute bottom-0 right-0 z-0 w-full max-w-[200px] object-contain', {
                            hidden: isShort,
                        })}
                    />
                    <p className="mb-2 font-lilita text-xl">Programs</p>
                    <NavItem
                        to="bookings"
                        label="Partis, Events & Incursions"
                        onClick={() => setDrawerOpen(false)}
                        icon={<PartyPopper className="mr-2 h-4 w-4" />}
                    />
                    <NavItem
                        to="holiday-program"
                        label="Holiday Programs"
                        icon={<Calendar className="mr-2 h-4 w-4" />}
                        onClick={() => setDrawerOpen(false)}
                    />
                    <NavItem
                        to="after-school-program"
                        label="After School Program"
                        icon={<GraduationCap className="mr-2 h-4 w-4" />}
                        onClick={() => setDrawerOpen(false)}
                    />
                    <p className="my-2 font-lilita text-xl">Creations</p>
                    <NavItem
                        label="Creation Instructions"
                        to="creations"
                        icon={<BookOpenText className="mr-2 h-4 w-4" />}
                        onClick={() => setDrawerOpen(false)}
                    />
                    <p className="my-2 font-lilita text-xl">Useful Links</p>
                    <Link
                        onClick={() => setDrawerOpen(false)}
                        to="https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform"
                        className="flex items-center rounded-xl p-3 hover:bg-slate-200"
                    >
                        <Flag className="mr-2 h-4 w-4" />
                        Incident Reporting
                    </Link>
                    {(isAdmin || canAccessPayroll) && (
                        <>
                            <p className="my-2 font-lilita text-xl">Admin</p>
                            {isAdmin && (
                                <NavItem
                                    label="After School Program Invoicing"
                                    to="after-school-program-invoicing"
                                    onClick={() => setDrawerOpen(false)}
                                    icon={<CreditCard className="mr-2 h-4 w-4" />}
                                />
                            )}
                            {(isAdmin || canAccessPayroll) && (
                                <NavItem
                                    label="Payroll"
                                    onClick={() => setDrawerOpen(false)}
                                    to="payroll"
                                    icon={<HandCoins className="mr-2 h-4 w-4" />}
                                />
                            )}
                            {isAdmin && (
                                <NavItem
                                    onClick={() => setDrawerOpen(false)}
                                    label="Onboarding"
                                    to="onboarding"
                                    icon={<Users className="mr-2 h-4 w-4" />}
                                />
                            )}
                            {isAdmin && (
                                <NavItem
                                    label="Discount Codes"
                                    onClick={() => setDrawerOpen(false)}
                                    to="discount-codes"
                                    icon={<TicketPercent className="mr-2 h-4 w-4" />}
                                />
                            )}
                        </>
                    )}
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    )
}

function NavItem({ to, label, icon, onClick }: { to: string; label: string; icon: ReactNode; onClick: () => void }) {
    const { pathname } = useLocation()
    return (
        <Link
            onClick={onClick}
            to={to}
            className={cn('flex items-center rounded-xl p-3 hover:bg-slate-200', {
                'bg-[#B14594] text-white hover:bg-[#a23f88]': pathname === `/dashboard/${to}`,
            })}
        >
            {icon}
            {label}
        </Link>
    )
}
