import { SignIn, SignUp } from '@clerk/clerk-react'
import { useMediaQuery } from '@mui/material'

export function SignInPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    return (
        <main className="twp flex h-full">
            <div className="relative hidden w-1/2 bg-slate-800 lg:block">
                <h1 className="absolute left-8 top-8 font-lilita text-3xl text-white">The Fizz Kidz Portal</h1>
                <div className="absolute bottom-8 flex w-full flex-col gap-8 p-8">
                    <p className="font-gotham text-xl text-white">A single place to manage all things Fizz.</p>
                </div>
            </div>
            <div className="flex w-full items-center justify-center lg:w-1/2">
                <SignIn
                    appearance={{
                        variables: {
                            colorPrimary: '#B14594',
                        },
                        elements: {
                            logoImage: { height: 48 },
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
