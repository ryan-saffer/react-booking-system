import { FormProvider, useForm } from 'react-hook-form'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { BookingForm } from '../form/booking-form'
import { PlayLabBookingForm, formSchema } from '../form/form-schema'

export function PlayLabEnrolmentPage() {
    const form = useForm<PlayLabBookingForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studio: null,
            appointmentTypeId: null,
            parentFirstName: '',
            parentLastName: '',
            parentEmailAddress: '',
            parentPhone: '',
            // children: [
            //     {
            //         firstName: '',
            //         lastName: '',
            //         dob: undefined,
            //         grade: undefined,
            //         hasAllergies: undefined,
            //         allergies: undefined,
            //     },
            // ],
            emergencyContactName: '',
            emergencyContactRelation: '',
            emergencyContactNumber: '',
            pickupPeople: [{ pickupPerson: '' }],
            termsAndConditions: false,
            joinMailingList: true,
        },
    })

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center font-lilita text-2xl font-extralight">Play Lab Booking Form</h1>
                <Separator className="my-4" />
                <FormProvider {...form}>
                    <Form {...form}>
                        <form>
                            <BookingForm />
                        </form>
                    </Form>
                </FormProvider>
            </div>
        </Root>
    )
}
