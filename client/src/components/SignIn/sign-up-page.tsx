import { Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Separator } from '@ui-components/separator'

import { SignInUpLayout } from './sign-up-layout'

const formSchema = z.object({
    email: z.string().min(1, { message: 'Email cannot be empty.' }).email(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
})

export function SignUpPage() {
    const firebase = useFirebase()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const [loading, setLoading] = useState(false)

    const signInWithGoogle = async () => {
        try {
            await firebase.doSignInWithGoogle()
            navigate('../dashboard')
        } catch (err: any) {
            toast.error(err?.message)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)
            await firebase.doCreateUserWithEmailAndPassword(values.email, values.password)
        } catch (err: any) {
            if (err.code == 'auth/weak-password') {
                toast.error('Password is too weak.')
            } else if (err.code === 'auth/email-already-in-use') {
                toast.error(
                    <div className="flex items-center gap-4 font-medium">
                        <Info className="h-10 w-10" />
                        <span>
                            An account with this email address already exists. If you have forgotten your password, you
                            can{' '}
                            <Link to="/reset-password" className="font-bold text-destructive">
                                reset it here.
                            </Link>
                            <br />
                            <br />
                            Haven't created an account before? You may have been invited to the portal, and need to{' '}
                            <Link to="/reset-password" className="font-bold text-destructive">
                                create a new password.
                            </Link>
                        </span>
                    </div>,
                    { duration: 10000, closeButton: true }
                )
            } else {
                toast.error('Invalid email address and password.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <SignInUpLayout>
            <div className="z-50 m-8 w-full max-w-[400px] rounded-lg border bg-gray-50 shadow-md">
                <div className="flex flex-col rounded-lg border-b bg-white px-10 py-6">
                    <img src="/fizz-logo.png" className="h-12 object-contain" />
                    <p className="mt-4 text-center font-bold">Create your account</p>
                    <p className="mt-2 text-center text-[13px] font-light text-[#747686]">
                        Welcome! Please fill in the details to get started.
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
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="grid w-full max-w-sm items-center gap-1.5"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px]">Email address</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-8" />
                                        </FormControl>
                                        <FormMessage className="text-[13px] italic" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px]">Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-8" type="password" />
                                        </FormControl>
                                        <FormMessage className="text-[13px] italic" />
                                    </FormItem>
                                )}
                            />
                            <Button className="mt-4 h-8 bg-[#B14594] hover:bg-[#b0288c]" type="submit">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="flex h-12 flex-col  items-center justify-center gap-2">
                    <p className="text-center text-[13px] text-[#747686]">
                        Already have an account?{' '}
                        <span className="font-medium text-[#B14594] hover:underline">
                            <Link to="../sign-in">Sign in</Link>
                        </span>
                    </p>
                </div>
            </div>
        </SignInUpLayout>
    )
}
