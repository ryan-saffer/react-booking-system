import { CheckCircle, Loader2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'

import { useEnrolmentForm } from './form-schema'

export function WaitingListForm({ isSuccess, submitting }: { isSuccess: boolean; submitting: boolean }) {
    const form = useEnrolmentForm()

    return (
        <div className="twp mt-4">
            <h3 className="mb-2 text-xl font-semibold">Join the wait list</h3>
            <p className="mb-4">If a place becomes available we will contact you straight away!</p>
            {isSuccess ? (
                <>
                    <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Done!</AlertTitle>
                        <AlertDescription>
                            You are on the waitlist. We will contact if you a spot opens up.
                        </AlertDescription>
                    </Alert>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="waitingList.waitingListParentName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="waitingList.waitingListChildName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="waitingList.waitingListParentEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your email address</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="waitingList.waitingListParentMobile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your phone number</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="mt-2 bg-[#A14181]" type="submit">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join waitlist'}
                    </Button>
                </div>
            )}
        </div>
    )
}
