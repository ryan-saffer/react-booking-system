import { capitalise } from 'fizz-kidz'
import { CalendarDays, CheckCircle2, MapPin, PartyPopper, Send, Share2, Sparkles, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@ui-components/button'

import { Navbar } from '../navbar'
import { hasRequiredState } from '../utils/has-required-state'

// http://localhost:3000/invitation/v2?parentName=Ryan&parentMobile=0413892120&childName=Marlee&bookingId=0GSCAS0KUU7b2YffTXPR&childAge=5&date=2024-10-06T06%3A56%3A38.673Z&time=10am&$type=studio&studio=essendon&rsvpDate=2024-10-06T06%3A56%3A38.673Z
// http://localhost:3000/invitation/v2?parentName=Ryan&parentMobile=0413892120&childName=Marlee&bookingId=1t29Q2jfALbvD4R4xpul&childAge=5&date=2024-10-06T06%3A56%3A38.673Z&time=10am&$type=studio&studio=essendon&rsvpDate=2024-10-06T06%3A56%3A38.673Z
//
// http://dev.fizzkidz.com.au/invitation/v2?parentName=Ryan&parentMobile=0413892120&childName=Marlee&bookingId=0GSCAS0KUU7b2YffTXPR&childAge=5&date=2024-10-06T06%3A56%3A38.673Z&time=10am&$type=studio&studio=essendon&rsvpDate=2024-10-06T06%3A56%3A38.673Z

export function CreateInvitationPage() {
    const [searchParams] = useSearchParams()

    const navigate = useNavigate()

    const childName = searchParams.get('childName')
    const childAge = searchParams.get('childAge')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const $type = searchParams.get('$type')
    const studio = searchParams.get('studio')
    const address = searchParams.get('address')
    const parentName = searchParams.get('parentName')
    const parentMobile = searchParams.get('parentMobile')
    const rsvpDate = searchParams.get('rsvpDate')
    const bookingId = searchParams.get('bookingId')

    const hasRequiredQueryParams = hasRequiredState(
        bookingId,
        parentName,
        parentMobile,
        childName,
        childAge,
        date,
        time,
        $type,
        studio,
        address,
        rsvpDate
    )

    const formattedDate = formatDate(date)
    const formattedRsvpDate = formatDate(rsvpDate)
    const location =
        $type === 'studio' && studio
            ? `${capitalise(studio)} studio`
            : $type === 'mobile' && address
              ? address
              : undefined

    async function navigateToDesignInvitation() {
        navigate('design', {
            state: {
                bookingId,
                childName,
                childAge,
                parentName,
                parentMobile,
                date: new Date(date!), // serialize into real date
                time,
                $type,
                studio,
                address,
                rsvpDate: new Date(rsvpDate!), // serialize into real date
            },
        })
    }

    return (
        <div className="twp min-h-screen bg-gradient-to-br from-[#F7F1FF] via-white to-[#EAF6FF]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-10">
                {!hasRequiredQueryParams ? (
                    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-lg">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-[#9B3EEA]" />
                            <p className="text-lg font-semibold text-slate-800">Missing details</p>
                        </div>
                        <p className="mt-4 text-slate-600">
                            To generate your invitations, please open the personalised link from the email we sent you.
                            This ensures we pull through all the party details automatically.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-2xl backdrop-blur">
                        <div className="relative overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F3D9FF]/70 via-white to-[#C9E8FF]/70" />
                            <div className="relative grid gap-10 px-8 py-10 lg:grid-cols-[1.2fr_0.9fr] lg:px-12 lg:py-12">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#9B3EEA] ring-1 ring-[#9B3EEA]/20">
                                        <PartyPopper className="h-4 w-4" />
                                        {childName ? `${childName}'s party is booked!` : 'Party booked'}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="font-lilita text-4xl text-slate-900 lg:text-5xl">
                                            Let&apos;s create a beautiful invite
                                        </p>
                                        {childName && parentName && (
                                            <p className="text-lg leading-relaxed text-slate-600 lg:text-xl">
                                                Hi {parentName}, we&apos;ll guide you through choosing a design,
                                                personalising the details, and sharing it with {childName}&apos;s
                                                friends. You&apos;ll also be able to track RSVP responses in one place.
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoRow icon={<CalendarDays />} label="Party date" value={formattedDate} />
                                        <InfoRow icon={<User />} label="RSVP to" value={parentName!} />
                                        <InfoRow icon={<Send />} label="RSVP by" value={formattedRsvpDate} />
                                        <InfoRow icon={<MapPin />} label="Location" value={location} />
                                        <InfoRow
                                            icon={<Sparkles />}
                                            label="Age"
                                            value={childAge ? `${childAge} yrs` : undefined}
                                        />
                                        <InfoRow icon={<Share2 />} label="Time" value={time!} />
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        You can tweak any of these details on the next step before sending.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-[#F7F9FB] p-6 shadow-inner">
                                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#9B3EEA]">
                                        What happens next
                                    </p>
                                    <p className="mt-3 text-xl font-semibold text-slate-900">Four quick steps</p>
                                    <div className="mt-6 grid gap-4">
                                        <Step
                                            number="1"
                                            title="Pick a design"
                                            description="Choose an invitation style that fits your party vibe."
                                        />
                                        <Step
                                            number="2"
                                            title="Add details"
                                            description="We pre-fill everything for you - just double check and confirm."
                                        />
                                        <Step
                                            number="3"
                                            title="Share instantly"
                                            description="Send via WhatsApp, text, or email with one link."
                                        />
                                        <Step
                                            number="4"
                                            title="Track RSVP"
                                            description="Guests RSVP online and you can see responses in real time."
                                        />
                                    </div>
                                    <Button
                                        onClick={navigateToDesignInvitation}
                                        className="mt-8 w-full rounded-2xl bg-[#9B3EEA] text-base font-semibold shadow-lg hover:bg-[#8B2DE3]"
                                    >
                                        Start designing
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-white/90 px-6 py-4 text-sm text-slate-600 lg:px-10">
                            <CheckCircle2 className="h-4 w-4 text-[#9B3EEA]" />
                            Keep the link handy - you'll return here anytime to update designs or resend invites.
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="flex gap-4 rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E7FF] text-lg font-bold text-[#9B3EEA]">
                {number}
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
        </div>
    )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 rounded-xl border border-white/60 bg-white/70 p-3 shadow-sm">
            <div className="mt-0.5 text-[#9B3EEA]">{icon}</div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    )
}

function formatDate(value: string | null) {
    if (!value) return undefined
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return undefined
    return new Intl.DateTimeFormat('en-AU', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed)
}
