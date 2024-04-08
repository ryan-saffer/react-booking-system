import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Button } from '@ui-components/button'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { Separator } from '@ui-components/separator'

import { SignInUpLayout } from './SignInUpLayout'

export function SignInPage() {
    const firebase = useFirebase()
    const navigate = useNavigate()

    const signInWithGoogle = async () => {
        try {
            await firebase.doSignInWithGoogle()
            navigate('../dashboard')
        } catch (err: any) {
            toast.error(err?.message)
        }
    }

    return (
        <SignInUpLayout>
            <div className="z-50 m-8 w-full max-w-[400px] rounded-lg border bg-gray-50 shadow-md lg:border-none lg:bg-transparent lg:shadow-none">
                <div className="flex flex-col rounded-lg border-b bg-white px-10 py-8 lg:border-none">
                    <img src="/fizz-logo.png" className="h-12 object-contain" />
                    <p className="mt-4 text-center font-bold">Sign in to Fizz Kidz</p>
                    <p className="mt-2 text-center text-[13px] font-light text-[#747686]">
                        Welcome back! Please sign in to continue
                    </p>
                    <Button
                        className="mt-8 flex h-8 w-full gap-4 border bg-white text-gray-500 shadow-sm hover:bg-gray-100"
                        onClick={signInWithGoogle}
                    >
                        <img className="w-4" src="https://img.clerk.com/static/google.svg?width=160" />
                        Continue with Google
                    </Button>
                    <div className="my-6 flex w-full items-center gap-4">
                        <Separator className="shrink" />
                        <p className="text-[13px] font-light text-[#747686]">or</p>
                        <Separator className="shrink" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label className="mb-1 text-[13px]" htmlFor="email">
                            Email address
                        </Label>
                        <Input type="email" id="email" className="h-8" />
                    </div>
                    <Button className="mt-8 h-8 bg-[#B14594] hover:bg-[#b0288c]">Continue</Button>
                </div>
                <div className="flex h-12 items-center justify-center">
                    <p className="text-center text-[13px] text-[#747686]">
                        Don't have an account?{' '}
                        <span className="font-medium text-[#B14594] hover:underline">
                            <Link to="../sign-up">Sign up</Link>
                        </span>
                    </p>
                </div>
            </div>
        </SignInUpLayout>
    )
}
