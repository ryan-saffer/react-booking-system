import { useForm } from 'react-hook-form'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { BackButton } from '../form/components/back-button'
import { BookingTypeSelector } from '../form/components/booking-type-selector'
import { CasualProgramSelector } from '../form/components/casual-program-selector'
import { CustomerDetails } from '../form/components/customer-details'
import { Payment } from '../form/components/payment'
import { Stepper } from '../form/components/stepper'
import { StudioSelector } from '../form/components/studio-selector'
import { Success } from '../form/components/sucess'
import { TermProgramSelector } from '../form/components/term-program-selector'
import { PlayLabBookingForm, formSchema } from '../form/form-schema'

export function PlayLabBookingPage() {
    const form = useForm<PlayLabBookingForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studio: null,
            appointmentTypeId: null,
            bookingType: null,
            parentFirstName: 'Ryan',
            parentLastName: 'Saffer',
            parentEmailAddress: 'ryansaffer@gmail.com',
            parentPhone: '0413892120',
            children: [
                {
                    firstName: 'Marlee',
                    lastName: 'Meltzer',
                    dob: new Date(),
                    hasAllergies: false,
                    allergies: undefined,
                },
            ],
            emergencyContactName: 'Talia Meltzer',
            emergencyContactRelation: 'Mother',
            emergencyContactNumber: '0448805073',
            // pickupPeople: [{ pickupPerson: '' }],
            termsAndConditions: true,
            joinMailingList: true,
        },
    })

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center font-lilita text-2xl font-extralight">Play Lab Booking Form</h1>
                <Separator className="my-4" />
                <Form {...form}>
                    <Stepper />
                    <BackButton />
                    <StudioSelector />
                    <BookingTypeSelector />
                    <TermProgramSelector />
                    <CasualProgramSelector />
                    <CustomerDetails />
                    <Payment />
                    <Success />
                </Form>
            </div>
        </Root>
    )
}
