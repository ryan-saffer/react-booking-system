import type { ReactNode } from 'react'

export function SignInUpLayout({ children }: { children: ReactNode }) {
    return (
        <main className="twp flex h-full">
            <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:block">
                <div className="absolute left-12 top-20">
                    <img src="/fizz-logo.png" className="mb-4 w-24" />
                    <h1 className="font-lilita text-3xl text-white">The Fizz Kidz portal</h1>
                </div>
                <div className="absolute top-0 flex h-full w-full flex-col items-center justify-center gap-2">
                    <p className="font-lilita text-3xl text-cyan-400">BIRTHDAY PARTIES</p>
                    <p className="font-lilita text-3xl text-cyan-200">HOLIDAY PROGRAMS</p>
                    <p className="font-lilita text-3xl text-cyan-400">AFTER SCHOOL PROGRAMS</p>
                    <p className="font-lilita text-3xl text-cyan-200">PRESCHOOL PROGRAMS</p>
                    <p className="font-lilita text-3xl text-cyan-400">EVENTS & MORE!</p>
                </div>
                <div className="absolute bottom-20 left-12">
                    <p className="font-gotham text-lg font-bold text-white">
                        Your place to manage all things Fizz Kidz.
                    </p>
                    d
                </div>
            </div>
            <div className="relative flex w-full items-center justify-center lg:w-1/2">
                <img src="/login-background-top.png" className="absolute top-0 z-10 w-full object-cover" />
                <img src="/login-background-bottom.png" className="absolute bottom-0 z-0 w-full object-cover" />
                {children}
            </div>
        </main>
    )
}
