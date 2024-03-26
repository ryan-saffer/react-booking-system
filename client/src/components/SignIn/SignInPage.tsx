import { SignIn } from '@clerk/clerk-react'
import { useMediaQuery } from '@mui/material'

import { SignInUpLayout } from './SignInUpLayout'

export function SignInPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    return (
        <SignInUpLayout>
            <SignIn
                signUpUrl="/sign-up"
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
        </SignInUpLayout>
    )
}
