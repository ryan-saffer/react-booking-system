import { parseISO } from 'date-fns'
import type { AcuityTypes } from 'fizz-kidz'
import { AlertCircle, ChevronLeft, MessageCircleWarning } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { useCartStore } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm } from '../../form-schema'
import { ContinueButton } from './continue-button'

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
        category: import.meta.env.VITE_ENV === 'prod' ? ['play-lab'] : ['play-lab-test'],
        availableToBook: false,
    })

    const bookingType = form.watch('bookingType')

    if (formStage !== 'program-selection') return null
    if (!bookingType || bookingType === 'casual') return null

    if (isLoading) return <Loader />

    if (isError)
        return (
            <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                    There was an error retrieving the available sessions. Please try again later.
                </AlertDescription>
            </Alert>
        )

    if (isSuccess) {
        if (data.length === 0) {
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
        return (
            <>
                <p className="text-md mb-4 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Which program would you like to book?
                </p>
                {appointmentTypeId ? (
                    <>
                        <ProgramCard program={data.find((it) => it.id === appointmentTypeId)!} selected />
                        <ContinueOrError />
                    </>
                ) : (
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

    const setSelectedClasses = useCartStore((store) => store.setSelectedClasses)

    const studio = form.watch('studio')
    const appointmentTypeId = form.watch('appointmentTypeId')
    const numberOfKids = form.watch('children').length

    const now = useRef(Date.now())

    const { data, isLoading, isSuccess, isError } = trpc.acuity.classAvailability.useQuery(
        { appointmentTypeIds: [appointmentTypeId!], includeUnavailable: true, minDate: now.current },
        { enabled: !!appointmentTypeId, select: (data) => data.map((it) => ({ ...it, time: parseISO(it.time) })) }
    )

    const filteredClasses = useMemo(
        () => (isSuccess ? data.filter((it) => it.calendar.toLowerCase().includes(studio!)) : []),
        [isSuccess, data, studio]
    )
    const hasClasses = filteredClasses.length > 0
    const isFull = filteredClasses.some((klass) => klass.slotsAvailable === 0)

    useEffect(() => {
        if (isSuccess && hasClasses && !isFull) {
            setSelectedClasses(filteredClasses, numberOfKids)
        }
    }, [isSuccess, hasClasses, isFull, filteredClasses, setSelectedClasses, numberOfKids])

    function ReturnButton() {
        return (
            <Button variant="outline" className="mt-2 w-full" onClick={() => form.setValue('appointmentTypeId', null)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Return to all programs
            </Button>
        )
    }

    if (!studio) return null

    if (isLoading) return <Loader className="mt-4" />
    if (isError) return <p>Error</p>

    if (isSuccess) {
        if (!hasClasses) {
            return (
                <>
                    <Alert className="mt-4">
                        <MessageCircleWarning className="h-4 w-4" />
                        <AlertTitle>No classes available</AlertTitle>
                        <AlertDescription>
                            Unfortunately there are no classes available to book at the moment. Come back later and
                            check again.
                        </AlertDescription>
                    </Alert>
                    <ReturnButton />
                </>
            )
        }

        if (isFull) {
            return (
                <>
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
                    <ReturnButton />
                </>
            )
        }

        return (
            <>
                <ReturnButton />
                <ContinueButton />
            </>
        )
    }
}

function ProgramCard({ program, selected = false }: { program: AcuityTypes.Api.AppointmentType; selected?: boolean }) {
    const form = useBookingForm()
    const appointmentTypeId = form.watch('appointmentTypeId')
    const { day, time, description, begins, ages, color } = JSON.parse(program.description)

    function handleCardClick() {
        if (appointmentTypeId) form.setValue('appointmentTypeId', null)
        else form.setValue('appointmentTypeId', program.id)
    }

    return (
        <div
            key={program.id}
            className={cn('flex cursor-pointer gap-4 rounded-xl border p-5 hover:bg-gray-50', {
                'bg-gray-100 hover:bg-gray-100': selected,
            })}
            onClick={handleCardClick}
        >
            <img className="max-w-[100px] rounded-md object-cover" src={program.image} />
            <div>
                <p className={'font-lilita text-2xl'} style={{ color }}>
                    {program.name}
                </p>
                <p className="mb-2 text-sm italic">{ages}</p>
                <p className="font-semibold">{day}</p>
                <p className="font-semibold">{time}</p>
                <p className="mb-4 font-semibold">{begins}</p>
                <p className="mt-3">{description}</p>
            </div>
        </div>
    )
}
