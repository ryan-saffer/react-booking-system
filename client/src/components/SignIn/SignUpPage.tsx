import { SignUp } from '@clerk/clerk-react'
import { useMediaQuery } from '@mui/material'

import { SignInUpLayout } from './SignInUpLayout'

export function SignUpPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    return (
        <SignInUpLayout>
            <SignUp
                signInUrl="sign-in"
                appearance={{
                    variables: {
                        colorPrimary: '#B14594',
                    },
                    layout: {
                        showOptionalFields: false,
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
