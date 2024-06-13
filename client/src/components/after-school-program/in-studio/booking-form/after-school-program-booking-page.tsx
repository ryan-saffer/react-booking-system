import { ChevronLeft } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui-components/button'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'

import { BookingForm } from './booking-form'
import { formSchema } from './form-schema'
import { SchoolProgramSelection } from './school-program-selection'
import { StudioProgramSelection } from './studio-program-selection'
import { useSelectedProgram } from './use-selected-program'

export function AfterSchoolProgramInStudioBookingPage() {
    const [searchParams] = useSearchParams()
    const isStudio = searchParams.get('type') === 'studio'

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: isStudio ? 'studio' : 'school',
            programType: undefined,
            studio: undefined,
            parentFirstName: '',
            parentLastName: '',
            parentEmailAddress: '',
            parentPhone: '',
            children: [
                {
                    firstName: '',
                    lastName: '',
                    dob: undefined,
                    grade: undefined,
                    hasAllergies: undefined,
                    allergies: undefined,
                },
            ],
            emergencyContactName: '',
            emergencyContactRelation: '',
            emergencyContactNumber: '',
            pickupPeople: [{ pickupPerson: '' }],
            termsAndConditions: false,
        },
    })

    const selectedStudio = form.watch('studio')
    const selectedProgramType = form.watch('programType')

    const showBackButton = (isStudio && !!selectedStudio) || (!isStudio && !!selectedProgramType)

    const { selectedProgram, selectProgram } = useSelectedProgram()

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values)
    }

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center text-2xl">After School Program Enrolment Form</h1>
                <Separator className="my-4" />
                <FormProvider {...form}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {showBackButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                        if (selectedProgram) {
                                            selectProgram(null)
                                        } else {
                                            form.setValue('studio', undefined)
                                            form.setValue('programType', undefined)
                                        }
                                    }}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            )}
                            <div className="mt-4 flex flex-col gap-4">
                                {isStudio && <StudioProgramSelection />}
                                {!isStudio && <SchoolProgramSelection />}
                                {selectedProgram && <BookingForm />}
                            </div>
                        </form>
                    </Form>
                </FormProvider>
            </div>
        </Root>
    )
}
