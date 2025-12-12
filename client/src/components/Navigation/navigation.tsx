import { ArrowRight } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@components/Hooks/context/useAuth'
import { useOrg } from '@components/Session/use-org'
import afterSchool from '@drawables/after-school.webp'
import bodyGlitter from '@drawables/body-glitter.webp'
import energy from '@drawables/energy.webp'
import holidayPrograms from '@drawables/holiday-programs.webp'
import jonah from '@drawables/jonah.webp'
import kingsville from '@drawables/kingsville.webp'
import parties from '@drawables/parties.webp'
import { getOrgName } from '@utils/studioUtils'

type NavigationItem = {
    title: string
    to?: string
    imgSrc: string
    description?: string
    accent: string
    accentSoft: string
    tag?: string
    onClick?: () => void
}

const programs: NavigationItem[] = [
    {
        title: 'Parties, Events & Incursions',
        description: 'View the schedule, booking details and more.',
        to: 'bookings',
        imgSrc: parties,
        accent: '#ff4f9c',
        accentSoft: 'rgba(255, 79, 156, 0.14)',
    },
    {
        title: 'Holiday Programs',
        description: 'Run exclusively during the school holidays on every weekday.',
        to: `holiday-program?id=${import.meta.env.VITE_ENV === 'prod' ? '11036399' : '15026605'}`,
        imgSrc: holidayPrograms,
        accent: '#00c2e3',
        accentSoft: 'rgba(0, 194, 227, 0.16)',
    },
    {
        title: 'Play Lab',
        description: "Our dedicated under 5's year old program that expolores sensory and play.",
        to: 'play-lab',
        imgSrc: kingsville,
        accent: '#9ecc48',
        accentSoft: 'rgba(158, 204, 72, 0.16)',
    },
    {
        title: 'After School Program',
        description: 'Art & Science programs run at schools.',
        to: 'after-school-program',
        imgSrc: afterSchool,
        accent: '#f6ba34',
        accentSoft: 'rgba(246, 186, 52, 0.18)',
    },
]

const creations: NavigationItem[] = [
    {
        title: 'Birthday Party Creations',
        description: 'Step-by-step guides specific for birthday parties.',
        to: 'creations',
        imgSrc: bodyGlitter,
        accent: '#b14594',
        accentSoft: 'rgba(177, 69, 148, 0.14)',
    },
]

const usefulLinks: NavigationItem[] = [
    {
        title: 'Incident Reporting',
        description: 'Log any injuries or incidents on the floor.',
        imgSrc: energy,
        accent: '#00c2e3',
        accentSoft: 'rgba(0, 194, 227, 0.16)',
        tag: 'External',
        onClick: () =>
            window.open(
                'https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform',
                '_blank'
            ),
    },
    {
        title: 'Behaviour Management Plan',
        description: 'Our response plan for tricky moments.',
        imgSrc: jonah,
        accent: '#9ecc48',
        accentSoft: 'rgba(158, 204, 72, 0.16)',
        tag: 'PDF',
        onClick: () =>
            window.open('https://www.fizzkidz.com.au/holiday-programs-behaviour-management-plan.pdf', '_blank'),
    },
]

const adminItems: NavigationItem[] = [
    {
        title: 'After School Program Invoicing',
        description: 'Manage enrolments, send invoices and track their payments.',
        to: 'after-school-program-invoicing',
        imgSrc: 'https://api.dicebear.com/7.x/icons/svg?icon=envelope&scale=70&backgroundColor=E91171',
        accent: '#ff4f9c',
        accentSoft: 'rgba(255, 79, 156, 0.14)',
    },
    {
        title: 'Payroll',
        description: 'Generate timesheets ready for payroll.',
        to: 'payroll',
        imgSrc: 'https://api.dicebear.com/7.x/icons/svg?icon=cashCoin&scale=70&backgroundColor=4BC5D9&translateY=5',
        accent: '#00c2e3',
        accentSoft: 'rgba(0, 194, 227, 0.16)',
    },
    {
        title: 'Onboarding',
        description: 'Manage all new hires and onboarding steps in one place.',
        to: 'onboarding',
        imgSrc: 'https://api.dicebear.com/7.x/icons/svg?icon=signpost2&scale=70&backgroundColor=9ECC48',
        accent: '#9ecc48',
        accentSoft: 'rgba(158, 204, 72, 0.16)',
    },
    {
        title: 'Discount Codes',
        description: 'Create and manage promo codes.',
        to: 'discount-codes',
        imgSrc: 'https://api.dicebear.com/7.x/icons/svg?icon=ticketPerforated&scale=70&backgroundColor=B14594',
        accent: '#b14594',
        accentSoft: 'rgba(177, 69, 148, 0.14)',
    },
    {
        title: 'School Zone Map',
        description: 'Catchment reference for after school programs.',
        to: 'after-school-program-map',
        imgSrc: 'https://api.dicebear.com/7.x/icons/svg?icon=map&scale=70&backgroundColor=F6BA34',
        accent: '#f6ba34',
        accentSoft: 'rgba(246, 186, 52, 0.18)',
    },
]

export const Navigation = () => {
    const { hasPermission, currentOrg } = useOrg()
    const auth = useAuth()

    return (
        <div className="min-h-full bg-[radial-gradient(circle_at_16%_20%,rgba(255,79,156,0.12),transparent_26%),radial-gradient(circle_at_80%_12%,rgba(0,194,227,0.12),transparent_22%),linear-gradient(140deg,#fef6fb_0%,#fdf5e6_35%,#f0f7ff_100%)] px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <header className="relative isolate overflow-hidden py-6 sm:py-8">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-16 top-0 h-36 w-36 rounded-full bg-[rgba(255,79,156,0.06)] blur-3xl" />
                        <div className="absolute -top-12 right-2 h-28 w-28 rounded-full bg-[rgba(0,194,227,0.08)] blur-3xl" />
                        <div className="absolute bottom-4 left-16 h-28 w-28 rounded-full bg-[rgba(246,186,52,0.08)] blur-3xl" />
                    </div>
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex flex-col gap-3">
                            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                                <span className="h-2 w-2 rounded-full bg-lime-400" />
                                Welcome{auth?.firstname ? ` ${auth.firstname}` : '!'}
                            </span>
                            <h1 className="lilita m-0 bg-gradient-to-r from-[#ff4f9c] via-[#f6ba34] to-[#00c2e3] bg-clip-text text-3xl leading-tight text-transparent sm:text-5xl">
                                Let's party!
                            </h1>
                            <p className="m-0 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                                Welcome to the Fizz Kidz Portal. Use this as a launchpad to access all things Fizz.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[currentOrg ? getOrgName(currentOrg) : 'No Studio Selected'].map((pill) => (
                                <span
                                    key={pill}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-[0_6px_12px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#00c2e3]" />
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <Section
                        title="Programs"
                        subtitle="View and edit bookings and manage children attendance."
                        items={programs}
                    />
                    <Section
                        title="Creations"
                        subtitle="View all of our creations with step by step instructions on how to make them."
                        items={creations}
                    />
                    <Section title="Quick links" subtitle="Open-and-go references." items={usefulLinks} />
                    {hasPermission('admin') && (
                        <Section
                            title="Ops & admin"
                            subtitle="Tools to manage all our operations. Requires admin access to view."
                            items={adminItems}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function Section({ title, subtitle, items }: { title: string; subtitle?: string; items: NavigationItem[] }) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.1)] backdrop-blur sm:p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-col">
                    <h2 className="lilita m-0 text-xl text-slate-900 sm:text-2xl">{title}</h2>
                    {subtitle ? <p className="m-0 text-sm text-slate-600">{subtitle}</p> : null}
                </div>
            </div>
            <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <ListItem key={item.title} {...item} />
                ))}
            </div>
        </section>
    )
}

function ListItem({ title, to, imgSrc, onClick, description, accent, accentSoft, tag }: NavigationItem) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!to && onClick) {
            event.preventDefault()
            onClick()
            return
        }

        if (onClick) {
            onClick()
        }
    }

    return (
        <Link
            to={to ?? '#'}
            onClick={handleClick}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-4 text-inherit no-underline shadow-md ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-[var(--accent-soft)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            style={{
                ['--accent' as string]: accent,
                ['--accent-soft' as string]: accentSoft,
            }}
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <img src={imgSrc} alt={`${title} icon`} className="h-14 w-14 rounded-xl object-cover object-center" />
                <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="m-0 text-base font-extrabold text-slate-900 sm:text-[17px]">{title}</h4>
                        {tag ? (
                            <span
                                className="hidden items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:flex"
                                style={{ backgroundColor: accentSoft, color: accent }}
                            >
                                {tag} <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        ) : null}
                    </div>
                    {description ? (
                        <p className="m-0 line-clamp-2 text-sm leading-snug text-slate-600">{description}</p>
                    ) : null}
                </div>
            </div>
        </Link>
    )
}
