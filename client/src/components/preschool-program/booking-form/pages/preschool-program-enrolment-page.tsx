import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle, ChevronLeft, MessageCircleWarning } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { StudioOrTest } from 'fizz-kidz'

import Loader from '@components/Shared/Loader'
import Root from '@components/Shared/Root'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Form } from '@ui-components/form'
import { Separator } from '@ui-components/separator'
import { useTRPC } from '@utils/trpc'

import { PreschoolProgramDetailsForm } from '../components/preschool-program-details-form'
import { ProgramSelection } from '../components/program-selection'
import { SelectedProgramSummary } from '../components/selected-program-summary'
import { StudioSelector } from '../components/studio-selector'
import { useEnrolmentStore } from '../state/enrolment-store'
import { defaultValues, formSchema } from '../state/form-schema'
import { resolveCalendarStudio } from '../utils/resolve-calendar-studio'

import type { PreschoolProgramForm } from '../state/form-schema'

const PRESCHOOL_PROGRAM_CATEGORIES: Array<'preschool-program' | 'preschool-program-test'> =
    import.meta.env.VITE_ENV === 'prod' ? ['preschool-program'] : ['preschool-program-test']

export function PreschoolProgramEnrolmentPage() {
    const trpc = useTRPC()

    const formStage = useEnrolmentStore((store) => store.formStage)
    const selectedStudio = useEnrolmentStore((store) => store.selectedStudio)
    const selectedProgram = useEnrolmentStore((store) => store.selectedProgram)
    const minDate = useEnrolmentStore((store) => store.minDate)
    const previousStage = useEnrolmentStore((store) => store.previousStage)
    const showSuccess = useEnrolmentStore((store) => store.showSuccess)

    const form = useForm<PreschoolProgramForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const {
        data: programs,
        isPending: loadingPrograms,
        isSuccess: loadedPrograms,
    } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category: PRESCHOOL_PROGRAM_CATEGORIES,
            availableToBook: true,
        })
    )

    const { data: allClasses } = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            {
                appointmentTypeIds: programs?.map((program) => program.id) || [],
                includeUnavailable: true,
                minDate,
            },
            { enabled: !!programs }
        )
    )

    const availableStudios = useMemo(() => {
        if (!allClasses) return []

        return Array.from(
            new Set(
                allClasses
                    .map((klass) => resolveCalendarStudio(klass.calendarID))
                    .filter((studio): studio is StudioOrTest => !!studio)
            )
        ).sort((a, b) => (a < b ? -1 : 1))
    }, [allClasses])

    const filteredPrograms = useMemo(() => {
        if (!programs || !allClasses || !selectedStudio) return []

        return programs.filter((program) =>
            allClasses.some(
                (klass) =>
                    klass.appointmentTypeID === program.id && resolveCalendarStudio(klass.calendarID) === selectedStudio
            )
        )
    }, [programs, allClasses, selectedStudio])

    const {
        data: classes,
        isPending: loadingClasses,
        isSuccess: loadedClasses,
        isError: isClassesError,
    } = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            {
                appointmentTypeIds: selectedProgram ? [selectedProgram.id] : [],
                includeUnavailable: true,
                minDate,
            },
            { enabled: !!selectedProgram }
        )
    )

    const { mutateAsync: createEnrolment, isPending: submitting } = useMutation(
        trpc.preschoolProgram.createEnrolment.mutationOptions()
    )

    const sessionCount = classes?.length ?? 0
    const termHasAvailability = !!classes?.length && classes.every((klass) => klass.slotsAvailable > 0)

    async function onSubmit(values: PreschoolProgramForm) {
        if (!selectedProgram) {
            toast.error('Please select a program first.')
            return
        }

        const calendarId = classes?.[0]?.calendarID

        if (!calendarId) {
            toast.error('This program is missing its calendar configuration.')
            return
        }

        try {
            await Promise.all(
                values.children.map((child) =>
                    createEnrolment({
                        appointmentTypeId: selectedProgram.id,
                        calendarId,
                        parent: {
                            firstName: values.parentFirstName,
                            lastName: values.parentLastName,
                            email: values.parentEmailAddress,
                            phone: values.parentPhone,
                        },
                        child: {
                            firstName: child.firstName,
                            lastName: child.lastName,
                            dob: child.dob!.toISOString(),
                            allergies: child.allergies || '',
                            additionalInfo: child.additionalInfo || '',
                        },
                        emergencyContact: {
                            name: values.emergencyContactName,
                            relation: values.emergencyContactRelation,
                            phone: values.emergencyContactNumber,
                        },
                        className: selectedProgram.name,
                        joinMailingList: values.joinMailingList,
                    })
                )
            )
            showSuccess()
        } catch {
            toast.error('There was an error submitting the enrolment.')
        }
    }

    return (
        <Root logoSize="sm">
            <div className="w-full">
                <h1 className="text-center text-2xl">Preschool Program Enrolment Form</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Reserve your place for the full term. No payment is taken on this form.
                </p>
                <Separator className="my-4" />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {formStage === 'success' ? (
                            <Alert variant="success">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle className="font-semibold">Enrolment submitted</AlertTitle>
                                <AlertDescription className="font-medium">
                                    You should have a confirmation email with the details. After your free trial, we
                                    will be in touch to know if you want to continue with the term.
                                </AlertDescription>
                            </Alert>
                        ) : formStage === 'form' && selectedProgram ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={previousStage}
                                    className="self-start"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <SelectedProgramSummary program={selectedProgram} sessionCount={sessionCount} />
                                {loadingClasses ? (
                                    <Loader />
                                ) : isClassesError ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>Unable to load this term</AlertTitle>
                                        <AlertDescription>
                                            There was a problem checking the Preschool Program sessions. Please try
                                            again later.
                                        </AlertDescription>
                                    </Alert>
                                ) : loadedClasses && !termHasAvailability ? (
                                    <Alert>
                                        <MessageCircleWarning className="h-4 w-4" />
                                        <AlertTitle>Term unavailable</AlertTitle>
                                        <AlertDescription>
                                            One or more sessions in this term are full or unavailable, so this program
                                            cannot be enrolled right now.
                                        </AlertDescription>
                                    </Alert>
                                ) : loadedClasses ? (
                                    <PreschoolProgramDetailsForm submitting={submitting} />
                                ) : null}
                            </>
                        ) : loadingPrograms ? (
                            <Loader />
                        ) : loadedPrograms && programs.length > 0 ? (
                            <>
                                <StudioSelector studios={availableStudios} />
                                <ProgramSelection programs={filteredPrograms} />
                            </>
                        ) : (
                            <Alert>
                                <MessageCircleWarning className="h-4 w-4" />
                                <AlertTitle>No programs available</AlertTitle>
                                <AlertDescription>
                                    There are no preschool programs available to book at the moment.
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </Form>
            </div>
        </Root>
    )
}
