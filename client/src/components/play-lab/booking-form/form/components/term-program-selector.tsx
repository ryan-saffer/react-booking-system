import type { AcuityTypes } from 'fizz-kidz'
import { MessageCircleWarning } from 'lucide-react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

/**
 * Renders the list of appointment types.
 *
 * After selecting a type, it will check if all classes for the term have space.
 * If so, it will render a 'Continue' button. Otherwise it will show a message that the term is full.
 */
export function TermProgramSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const appointmentTypeId = form.watch('appointmentTypeId')

    const { data, isLoading, isSuccess, isError } = trpc.acuity.getAppointmentTypes.useQuery({
        category: ['play-lab-test'],
        availableToBook: false,
    })

    const bookingType = form.watch('bookingType')

    if (formStage !== 'studio-selection') return null
    if (!bookingType || bookingType === 'casual') return null

    if (isLoading) return <Loader />

    if (isError) return <p>Error</p>

    if (isSuccess) {
        return (
            <>
                <p className="text-md mb-4 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Which program would you like to book?
                </p>
                {appointmentTypeId && (
                    <>
                        <ProgramCard program={data.find((it) => it.id === appointmentTypeId)!} selected />
                        <ContinueOrError />
                    </>
                )}
                {!appointmentTypeId && (
                    <div className="flex flex-col gap-4">
                        {data.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))}
                    </div>
                )}
            </>
        )
    }
}

/**
 * Fetches the classes for the selected program and filters it to only classes for the selected studio.
 * Checks that classes exist, and that all the classes have a spot available.
 */
function ContinueOrError() {
    const form = useBookingForm()
    const studio = form.watch('studio')
    const appointmentTypeId = form.watch('appointmentTypeId')

    const { data, isLoading, isSuccess, isError } = trpc.acuity.classAvailability.useQuery(
        { appointmentTypeIds: [appointmentTypeId!], includeUnavailable: true },
        { enabled: !!appointmentTypeId }
    )

    if (!studio) return null

    if (isLoading) return <Loader />
    if (isError) return <p>Error</p>

    if (isSuccess) {
        const filteredClasses = data.filter((it) => it.calendar.toLowerCase().includes(studio))

        const hasClasses = filteredClasses.length !== 0
        const isFull = filteredClasses.some((klass) => klass.slotsAvailable === 0)

        if (!hasClasses) {
            return (
                <Alert className="mt-4">
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>No classes available</AlertTitle>
                    <AlertDescription>
                        Unfortunately there are no classes available to book at the moment. Come back later and check
                        again.
                    </AlertDescription>
                </Alert>
            )
        }

        if (isFull) {
            return (
                <Alert className="mt-4">
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>One or more classes are full</AlertTitle>
                    <AlertDescription>
                        Unfortunately one or more of the classes for the term are full, so a term booking is
                        unavailable.
                        <br />
                        <br />
                        You are still welcome to book casual sessions by changing your selection above.
                    </AlertDescription>
                </Alert>
            )
        }

        return (
            <Button className="mt-4 w-full" type="button">
                Continue
            </Button>
        )
    }
}

function ProgramCard({ program, selected = false }: { program: AcuityTypes.Api.AppointmentType; selected?: boolean }) {
    const form = useBookingForm()
    const appointmentTypeId = form.watch('appointmentTypeId')
    const { day, time, description, color } = JSON.parse(program.description)
    return (
        <div
            key={program.id}
            className={cn('cursor-pointer rounded-xl border p-8 hover:bg-gray-50', {
                'bg-gray-100 hover:bg-gray-100': selected,
            })}
            onClick={() => {
                if (appointmentTypeId) form.setValue('appointmentTypeId', null)
                else form.setValue('appointmentTypeId', program.id)
                // nextStage()
            }}
        >
            <p className={'font-lilita text-3xl'} style={{ color }}>
                {program.name}
            </p>
            <p className="text-lg font-semibold">{day}</p>
            <p className="mb-4 text-lg font-semibold">{time}</p>
            <p className="mt-3">{description}</p>
        </div>
    )
}
