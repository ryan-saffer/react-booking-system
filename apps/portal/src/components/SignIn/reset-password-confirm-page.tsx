import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'

import { SignInUpLayout } from './sign-up-layout'

const formSchema = z
    .object({
        password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
        confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    })

export function ResetPasswordConfirmPage() {
    const firebase = useFirebase()
    const [searchParams] = useSearchParams()
    const oobCode = searchParams.get('oobCode') || ''

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'success'>('checking')
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let ignore = false

        const validateCode = async () => {
            if (!oobCode) {
                setStatus('invalid')
                return
            }

            setStatus('checking')

            try {
                const accountEmail = await firebase.verifyPasswordResetCode(oobCode)

                if (!ignore) {
                    setEmail(accountEmail)
                    setStatus('ready')
                }
            } catch {
                if (!ignore) {
                    setStatus('invalid')
                }
            }
        }

        validateCode().catch(() => {
            if (!ignore) {
                setStatus('invalid')
            }
        })

        return () => {
            ignore = true
        }
    }, [firebase, oobCode])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setSubmitting(true)
            await firebase.confirmPasswordReset(oobCode, values.password)
            setStatus('success')
            form.reset()
        } catch (err: any) {
            if (err.code === 'auth/weak-password') {
                toast.error('Password is too weak.')
            } else if (err.code === 'auth/expired-action-code' || err.code === 'auth/invalid-action-code') {
                setStatus('invalid')
            } else {
                toast.error('There was an error resetting your password.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <SignInUpLayout>
            <div className="z-50 m-8 w-full max-w-[400px] rounded-lg border bg-gray-50 shadow-md">
                <div className="flex flex-col rounded-lg border-b bg-white px-10 py-6">
                    <img src="/fizz-logo.png" className="h-12 object-contain" />
                    <p className="mt-4 text-center font-bold">Choose a new password</p>
                    <p className="mb-4 mt-2 text-center text-[13px] font-light text-[#747686]">
                        Set a new password for your Fizz Kidz Portal account.
                    </p>
                    {status === 'checking' ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center text-[13px] text-[#747686]">
                            <Loader2 className="h-5 w-5 animate-spin text-[#B14594]" />
                            <p>Checking your reset link...</p>
                        </div>
                    ) : null}
                    {status === 'invalid' ? (
                        <Alert variant="destructive">
                            <AlertTitle className="text-sm">This link is no longer valid</AlertTitle>
                            <AlertDescription className="text-xs">
                                Password reset links can expire or only be used once. Request a new link from the{' '}
                                <Link to="/reset-password" className="font-semibold hover:underline">
                                    reset password page
                                </Link>
                                .
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {status === 'success' ? (
                        <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm">Password updated</AlertTitle>
                            <AlertDescription className="text-xs">
                                Your password has been reset successfully. Return to the{' '}
                                <Link to="/sign-in" className="font-semibold hover:underline">
                                    Sign In page
                                </Link>
                                .
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {status === 'ready' ? (
                        <>
                            <p className="mb-4 text-center text-[13px] text-[#747686]">
                                Resetting password for {email}
                            </p>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="grid w-full max-w-sm items-center gap-1.5"
                                >
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px]">New password</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-8" type="password" />
                                                </FormControl>
                                                <FormMessage className="text-[13px] italic" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px]">Confirm password</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-8" type="password" />
                                                </FormControl>
                                                <FormMessage className="text-[13px] italic" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className="mt-4 h-8 bg-[#B14594] hover:bg-[#b0288c]" type="submit">
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset password'}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    ) : null}
                </div>
                <div className="flex h-12 flex-col items-center justify-center gap-2">
                    <p className="text-center text-[13px] text-[#747686]">
                        Remembered it?{' '}
                        <span className="font-medium text-[#B14594] hover:underline">
                            <Link to="/sign-in">Sign in</Link>
                        </span>
                    </p>
                </div>
            </div>
        </SignInUpLayout>
    )
}
