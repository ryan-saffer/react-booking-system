import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'

import { SignInUpLayout } from './sign-up-layout'

const formSchema = z.object({
    email: z.string().min(1, { message: 'Email cannot be empty.' }).email(),
})

export function ResetPasswordPage() {
    const firebase = useFirebase()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)
            await firebase.resetPassword(values.email)
            setSuccess(true)
        } catch (err) {
            toast.error('An error occured during password reset.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SignInUpLayout>
            <div className="z-50 m-8 w-full max-w-[400px] rounded-lg border bg-gray-50 shadow-md">
                <div className="flex flex-col rounded-lg border-b bg-white px-10 py-6">
                    <img src="/fizz-logo.png" className="h-12 object-contain" />
                    <p className="mt-4 text-center font-bold">Reset your password</p>
                    <p className="mb-4 mt-2 text-center text-[13px] font-light text-[#747686]">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                    {success ? (
                        <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm">Email Sent</AlertTitle>
                            <AlertDescription className="text-xs">
                                A password reset link has been sent to your email. Once you have reset your password,
                                return to the{' '}
                                <Link to="../sign-in" className="font-semibold hover:underline">
                                    Sign In page.
                                </Link>
                            </AlertDescription>
                        </Alert>
                    ) : (
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
                                <Button className="mt-4 h-8 bg-[#B14594] hover:bg-[#b0288c]" type="submit">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
                                </Button>
                                <Link
                                    to="../sign-in"
                                    className="mt-4 text-[13px] font-medium text-[#B14594] hover:underline"
                                >
                                    Return to sign in
                                </Link>
                            </form>
                        </Form>
                    )}
                </div>
                <div className="flex h-12 flex-col  items-center justify-center gap-2">
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
