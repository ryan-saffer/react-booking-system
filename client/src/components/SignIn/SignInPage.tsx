import { SignIn } from '@clerk/clerk-react'
import { useMediaQuery } from '@mui/material'

export function SignInPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    return (
        <main className="twp flex h-full">
            <div className="hidden w-1/2 overflow-hidden bg-slate-900 lg:block">
                <div className="flex h-full flex-col justify-between p-12">
                    <h1 className="font-lilita text-3xl text-white">Welcome to the Fizz Kidz portal.</h1>
                    <p className="font-gotham text-lg font-bold text-white">
                        Your place to manage all things Fizz Kidz. View and manage birthday parties, holiday programs,
                        after school programs, events, payroll, onboarding, discount codes and much more!
                    </p>
                </div>
            </div>
            <div className="relative flex w-full items-center justify-center lg:w-1/2">
                <img src="/login-background-top.png" className="absolute top-0 z-10 w-full object-cover" />
                <img src="/login-background-bottom.png" className="absolute bottom-0 z-0 w-full object-cover" />
                <SignIn
                    appearance={{
                        variables: {
                            colorPrimary: '#B14594',
                        },
                        elements: {
                            logoImage: { height: 48 },
                            rootBox: {
                                zIndex: 100,
                            },
                            ...(isDesktop && {
                                cardBox: {
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                card: {
                                    border: 'none',
                                    boxShadow: 'none',
                                },
                                footer: {
                                    background: 'none',
                                },
                            }),
                        },
                    }}
                />
            </div>
        </main>
    )
}
