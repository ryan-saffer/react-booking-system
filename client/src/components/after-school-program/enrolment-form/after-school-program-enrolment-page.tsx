import { CheckCircle, ChevronLeft } from 'lucide-react'
import { DateTime } from 'luxon'
import { FormProvider, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { z } from 'zod'

import Root from '@components/Shared/Root'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'
import { useTRPC } from '@utils/trpc'

import { EnrolmentForm } from './enrolment-form'
import { formSchema } from './form-schema'
import { SchoolProgramSelection } from './school-program-selection'
import { StudioProgramSelection } from './studio-program-selection'
import { useSelectedProgram } from './use-selected-program'

import { useMutation } from '@tanstack/react-query'

export function AfterSchoolProgramEnrolmentPage() {
    const trpc = useTRPC()
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
                joinMailingList: true,
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
        isPending: submittingMain,
        isSuccess: isSuccessMain,
    } = useMutation(trpc.afterSchoolProgram.scheduleAfterSchoolEnrolment.mutationOptions())

    const {
        mutateAsync: joinWaitList,
        isPending: submittingWaitlist,
        isSuccess: isSuccessWaitlist,
    } = useMutation(trpc.afterSchoolProgram.joinWaitList.mutationOptions())

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!selectedProgram) {
            console.error('Enrolling before program has been selecte - this is impossible.')
            return
        }

        if (values.classIsFull) {
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

        let programType = values.programType
        if (inStudio) {
            if (import.meta.env.VITE_ENV === 'dev') {
                programType = 'science'
            } else if (selectedProgram.category.includes('science')) {
                programType = 'science'
            } else if (selectedProgram.category.includes('art')) {
                programType = 'art'
            } else {
                throw new Error(`Selected studio program category of '${selectedProgram.category}' is not recognised!`)
            }
        }

        try {
            await enrol(
                values.main.children.map((child) => ({
                    inStudio,
                    type: programType!,
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
                        age: Math.floor(Math.abs(DateTime.fromJSDate(child.dob!).diffNow('years').years)).toString(),
                        dob: child.dob!.toISOString(),
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
                    joinMailingList: values.main!.joinMailingList,
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
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {isSuccessMain ? (
                                <Alert variant="success">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle className="font-semibold">Done!</AlertTitle>
                                    <AlertDescription className="font-medium">
                                        You have successfully enrolled and should have a confirmation email waiting for
                                        you.
                                    </AlertDescription>
                                </Alert>
                            ) : isSuccessWaitlist ? (
                                <Alert variant="success">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle className="font-semibold">Done!</AlertTitle>
                                    <AlertDescription className="font-medium">
                                        You are on the waitlist. We will contact if you a spot opens up.
                                    </AlertDescription>
                                </Alert>
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
                                                    form.setValue('programType', undefined)
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
                                            <EnrolmentForm submitting={submittingMain || submittingWaitlist} />
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
