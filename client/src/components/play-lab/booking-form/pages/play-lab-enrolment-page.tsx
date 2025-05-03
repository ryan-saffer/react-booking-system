import { FormProvider, useForm } from 'react-hook-form'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { BackButton } from '../form/components/back-button'
import { BookingForm } from '../form/components/booking-form'
import { BookingTypeSelector } from '../form/components/booking-type-selector'
import { CasualProgramSelector } from '../form/components/casual-program-selector'
import { StudioSelector } from '../form/components/studio-selector'
import { TermProgramSelector } from '../form/components/term-program-selector'
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
            children: [
                {
                    firstName: '',
                    lastName: '',
                    dob: undefined,
                    hasAllergies: undefined,
                    allergies: undefined,
                },
            ],
            emergencyContactName: '',
            emergencyContactRelation: '',
            emergencyContactNumber: '',
            // pickupPeople: [{ pickupPerson: '' }],
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
                            <BackButton />
                            <StudioSelector />
                            <BookingTypeSelector />
                            <TermProgramSelector />
                            <CasualProgramSelector />
                            <BookingForm />
                        </form>
                    </Form>
                </FormProvider>
            </div>
        </Root>
    )
}
