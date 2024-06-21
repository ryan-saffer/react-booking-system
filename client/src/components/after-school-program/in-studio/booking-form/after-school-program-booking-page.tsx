import { CheckCircle, ChevronLeft } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'
import { trpc } from '@utils/trpc'

import { BookingForm } from './booking-form'
import { formSchema } from './form-schema'
import { SchoolProgramSelection } from './school-program-selection'
import { StudioProgramSelection } from './studio-program-selection'
import { useSelectedProgram } from './use-selected-program'

export function AfterSchoolProgramInStudioBookingPage() {
    const [searchParams] = useSearchParams()
    const inStudio = searchParams.get('type') === 'studio' // otherwise at a school

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: inStudio ? 'studio' : 'school',
            programType: undefined,
            studio: undefined,
            main: {
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
            waitingList: {
                waitingListParentName: '',
                waitingListParentEmail: '',
                waitingListParentMobile: '',
                waitingListChildName: '',
            },
        },
    })

    const selectedStudio = form.watch('studio')
    const selectedProgramType = form.watch('programType')

    const showBackButton = (inStudio && !!selectedStudio) || (!inStudio && !!selectedProgramType)

    const { selectedProgram, selectProgram } = useSelectedProgram()

    const {
        mutateAsync: enrol,
        isLoading: submittingMain,
        isSuccess: isSuccessMain,
    } = trpc.afterSchoolProgram.scheduleAfterSchoolEnrolment.useMutation()

    const {
        mutateAsync: joinWaitList,
        isLoading: submittingWaitlist,
        isSuccess: isSuccessWaitlist,
    } = trpc.afterSchoolProgram.joinWaitList.useMutation()

    const classIsFull = form.watch('classIsFull')

    const onError = (errors: any) => {
        console.error(errors)
        console.log({ classIsFull })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('SUBMITTING')
        console.log(values)

        if (!selectedProgram) {
            console.error('Enrolling before program has been selecte - this is impossible.')
            return
        }

        if (values.classIsFull) {
            console.log('CLASS FULL')
            if (!values.waitingList) {
                console.error("'waitingList' form cannot be empty at this point")
                return
            }
            try {
                await joinWaitList({
                    parentName: values.waitingList.waitingListParentName,
                    parentEmail: values.waitingList.waitingListParentEmail,
                    parentMobile: values.waitingList.waitingListParentMobile,
                    childName: values.waitingList.waitingListChildName,
                    program: selectedProgram.name,
                })
            } catch (err) {
                toast.error('There was an error joining the waitlist.')
            }
            return
        }

        if (!values.main) {
            console.error("'main' form cannot be empty at this point")
            return
        }

        try {
            await enrol(
                values.main.children.map((child) => ({
                    inStudio,
                    type: values.programType,
                    appointmentTypeId: selectedProgram.id,
                    calendarId: selectedProgram.calendarIDs[0],
                    parent: {
                        firstName: values.main!.parentFirstName,
                        lastName: values.main!.parentLastName,
                        phone: values.main!.parentPhone,
                        email: values.main!.parentEmailAddress,
                    },
                    child: {
                        firstName: child.firstName!,
                        lastName: child.lastName!,
                        age: '0', // TODO calculate age from DOB
                        grade: child.grade!,
                        allergies: child.allergies || '',
                        isAnaphylactic: !!child.isAnaphylactic,
                        anaphylaxisPlan: child.anaphylaxisPlan?.name || '',
                        support: child.support || '',
                        permissionToPhotograph: !!child.permissionToPhotograph,
                    },
                    emergencyContact: {
                        name: values.main!.emergencyContactName,
                        relation: values.main!.emergencyContactRelation,
                        phone: values.main!.emergencyContactNumber,
                    },
                    className: selectedProgram.name,
                    pickupPeople: values.main!.pickupPeople.map((person) => person.pickupPerson),
                }))
            )
        } catch (err) {
            toast.error('There was an error enrolling into the program.')
        }
    }

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center text-2xl">After School Program Enrolment Form</h1>
                <Separator className="my-4" />
                <FormProvider {...form}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                            {isSuccessMain ? (
                                <>
                                    <Alert variant="success">
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle className="font-semibold">Done!</AlertTitle>
                                        <AlertDescription className="font-medium">
                                            You have successfully enrolled and should have a confirmation email waiting
                                            for you.
                                        </AlertDescription>
                                    </Alert>
                                </>
                            ) : (
                                <>
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
                                                    // TODO fix this shit
                                                    // form.setValue('programType', undefined)
                                                }
                                            }}
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                    )}
                                    <div className="mt-4 flex flex-col gap-4">
                                        {inStudio && <StudioProgramSelection />}
                                        {!inStudio && <SchoolProgramSelection />}
                                        {selectedProgram && (
                                            <BookingForm
                                                submitting={submittingMain || submittingWaitlist}
                                                formSubmitted={isSuccessMain || isSuccessWaitlist}
                                            />
                                        )}
                                    </div>
                                </>
                            )}
                        </form>
                    </Form>
                </FormProvider>
            </div>
        </Root>
    )
}
