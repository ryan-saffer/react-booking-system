import { ArrowRight, Bug, RotateCw, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@ui-components/button'

export function ErrorScreen({
    label,
    text,
    showRefresh = false,
}: {
    label: string
    text: string
    showRefresh?: boolean
}) {
    const navigate = useNavigate()
    return (
        <main className="twp relative flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-sky-100 px-4 py-10 text-slate-900">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl" />
                <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
                <div className="absolute bottom-16 left-10 h-28 w-28 rounded-full bg-amber-200/60 blur-2xl" />
            </div>

            <section className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-10 shadow-[0_25px_80px_rgba(17,24,39,0.12)] backdrop-blur">
                <div className="absolute -right-10 -top-14 h-28 w-28 rotate-12 rounded-full bg-gradient-to-br from-orange-200/70 via-pink-200/60 to-sky-200/70 blur-3xl" />
                <div className="flex flex-col items-center gap-8 text-center">
                    <div className="flex w-full items-center justify-center gap-3 sm:justify-between">
                        <div className="hidden items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-100 sm:flex">
                            <Bug className="h4 w-4" />
                            Little Fizzle
                        </div>
                        <img src="/fizz-logo.png" alt="Fizz Kidz logo" className="h-12 sm:h-14" />
                    </div>

                    <div className="space-y-4">
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
                            <Sparkles className="h-4 w-4" />
                            Sorry about this
                        </div>
                        <h1 className="lilita text-4xl sm:text-5xl">{label}</h1>
                        <p className="text-slate-500">{text}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {showRefresh && (
                            <Button
                                onClick={() => location.reload()}
                                variant="ghost"
                                className="transition hover:-translate-y-0.5"
                            >
                                Refresh
                                <RotateCw className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-[#B14594] text-white shadow-lg shadow-[#B14594]/30 transition hover:-translate-y-0.5 hover:bg-[#9a3c82]"
                        >
                            Go Home
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}
