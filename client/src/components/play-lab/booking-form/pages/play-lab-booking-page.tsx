import { useForm } from 'react-hook-form'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { BackButton } from '../components/common/back-button'
import { Stepper } from '../components/common/stepper'
import { CustomerDetails } from '../components/stages/customer-details/customer-details'
import { Payment } from '../components/stages/payment/payment'
import { BookingTypeSelector } from '../components/stages/program-selection/booking-type-selector'
import { CasualProgramSelector } from '../components/stages/program-selection/casual-program-selector'
import { StudioSelector } from '../components/stages/program-selection/studio-selector'
import { TermProgramSelector } from '../components/stages/program-selection/term-program-selector'
import { Success } from '../components/stages/success/sucess'
import type { PlayLabBookingForm } from '../state/form-schema'
import { formSchema } from '../state/form-schema'

export function PlayLabBookingPage() {
    const form = useForm<PlayLabBookingForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studio: null,
            appointmentTypeId: null,
            bookingType: null,
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
                    additionalInfo: undefined,
                },
            ],
            emergencyContactName: '',
            emergencyContactRelation: '',
            emergencyContactNumber: '',
            reference: undefined,
            referenceOther: undefined,
            termsAndConditions: false,
            joinMailingList: true,
        },
    })

    return (
        <Root logoSize="sm" logoHref="https://www.fizzkidz.com.au/play-lab">
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
