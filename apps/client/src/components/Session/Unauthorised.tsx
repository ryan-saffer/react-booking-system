import { ArrowLeft, LockKeyhole, LogOut, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Button } from '@ui-components/button'

type Props = {
    showLogout?: boolean
}

const Unauthorised = ({ showLogout = false }: Props) => {
    const firebase = useFirebase()

    return (
        <main className="twp relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-[#f8f4fb] px-4 py-12">
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(177,69,148,0.20),_transparent_28rem),radial-gradient(circle_at_bottom_right,_rgba(2,215,247,0.22),_transparent_26rem)]"
                aria-hidden="true"
            />
            <div
                className="absolute left-[12%] top-[18%] h-16 w-16 rounded-full bg-[#FFDC5D]/60 blur-sm"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-[16%] right-[14%] h-24 w-24 rounded-full bg-[#9ecc48]/40 blur-md"
                aria-hidden="true"
            />
            <div className="absolute right-[28%] top-[14%] h-8 w-8 rounded-full bg-[#02D7F7]/50" aria-hidden="true" />

            <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(88,28,80,0.18)] backdrop-blur sm:p-10">
                <div className="absolute inset-x-10 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#B14594] via-[#FFDC5D] to-[#02D7F7]" />

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#B14594] text-white shadow-[0_18px_36px_rgba(177,69,148,0.30)]">
                    <LockKeyhole className="h-9 w-9" />
                </div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#B14594]/10 px-4 py-2 text-sm font-semibold text-[#8b2f73]">
                    <Sparkles className="h-4 w-4" />
                    403 access restricted
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    You are not authorised to view this page
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                    This area needs extra permissions for your selected studio or organisation. If this looks wrong,
                    switch studios using the selector in the top right, or ask an admin to update your access.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild className="bg-[#B14594] shadow-lg shadow-[#B14594]/20 hover:bg-[#9a357f]">
                        <Link to="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to dashboard
                        </Link>
                    </Button>
                    {showLogout && (
                        <Button variant="outline" onClick={firebase.doSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Unauthorised
