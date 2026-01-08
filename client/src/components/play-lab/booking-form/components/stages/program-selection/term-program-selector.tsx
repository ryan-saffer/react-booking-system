import { parseISO } from 'date-fns'
import type { AcuityTypes } from 'fizz-kidz'
import { AlertCircle, ChevronLeft, MessageCircleWarning } from 'lucide-react'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'

import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { useCart } from '../../../state/cart-store'
import { useBookingForm } from '../../../state/form-schema'
import { useFormStage } from '../../../state/form-stage-store'
import { ContinueButton } from './continue-button'

import { useQuery } from '@tanstack/react-query'
import { useWatch } from 'react-hook-form'

/**
 * Renders the list of appointment types.
 *
 * After selecting a type, it will check if all classes for the term have space.
 * If so, it will render a 'Continue' button. Otherwise it will show a message that the term is full.
 */
export function TermProgramSelector() {
    const trpc = useTRPC()
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const appointmentTypeId = useWatch({ control: form.control, name: 'appointmentTypeId' })
    const bookingType = useWatch({ control: form.control, name: 'bookingType' })

    const { data, isPending, isSuccess, isError } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category: import.meta.env.VITE_ENV === 'prod' ? ['play-lab'] : ['play-lab-test'],
            availableToBook: false,
        })
    )

    if (formStage !== 'program-selection') return null
    if (!bookingType || bookingType === 'casual') return null

    if (isPending) return <Loader />

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
                    <AlertTitle>No programs available</AlertTitle>
                    <AlertDescription>
                        Unfortunately there are no programs available to book at the moment. Come back later and check
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

function ReturnButton() {
    const form = useBookingForm()
    return (
        <Button variant="outline" className="my-2 w-full" onClick={() => form.setValue('appointmentTypeId', null)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Return to all programs
        </Button>
    )
}

/**
 * Fetches the classes for the selected program and filters it to only classes for the selected studio.
 * Checks that classes exist, and that all the classes have a spot available.
 */
function ContinueOrError() {
    const trpc = useTRPC()
    const form = useBookingForm()

    const setSelectedClasses = useCart((store) => store.setSelectedClasses)

    const studio = useWatch({ control: form.control, name: 'studio' })
    const appointmentTypeId = useWatch({ control: form.control, name: 'appointmentTypeId' })
    const watchedChildren = useWatch({ control: form.control, name: 'children' })
    const numberOfKids = watchedChildren.length

    const [now] = useState(() => Date.now())

    const { data, isPending, isSuccess, isError } = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            { appointmentTypeIds: [appointmentTypeId!], includeUnavailable: true, minDate: now },
            { enabled: !!appointmentTypeId, select: (data) => data.map((it) => ({ ...it, time: parseISO(it.time) })) }
        )
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

    if (!studio) return null

    if (isPending) return <Loader className="mt-4" />
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
        if (!hasClasses) {
            return (
                <>
                    <Alert className="mt-4">
                        <MessageCircleWarning className="h-4 w-4" />
                        <AlertTitle>No sessions available</AlertTitle>
                        <AlertDescription>
                            Unfortunately there are no sessions available to book at the moment. Come back later and
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
                        <AlertTitle>One or more sessions are full</AlertTitle>
                        <AlertDescription>
                            Unfortunately one or more of the sessions for the term are full, so a term enrolment is
                            unavailable.
                            <br />
                            <br />
                            You are still welcome to book casual sessions - just select 'Casual Booking' above.
                        </AlertDescription>
                    </Alert>
                    <ReturnButton />
                </>
            )
        }

        return (
            <>
                <div className="mt-6 flex flex-col gap-4">
                    {filteredClasses.map((klass) => (
                        <div key={klass.id} className="flex items-center space-x-2">
                            <Checkbox className="disabled:opacity-100" id={`${klass.id}`} disabled checked />
                            <label
                                htmlFor={`${klass.id}`}
                                className="flex cursor-pointer flex-col gap-1 text-sm font-medium peer-disabled:cursor-not-allowed"
                            >
                                <span>
                                    {DateTime.fromJSDate(klass.time).toFormat('cccc d LLLL, h:mm a')} -{' '}
                                    {DateTime.fromJSDate(klass.time)
                                        .plus({ minutes: klass.duration })
                                        .toFormat('h:mm a')}
                                </span>
                                {klass.slotsAvailable === 0 && (
                                    <span className="inline-block w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                                        Full
                                    </span>
                                )}
                                {klass.slotsAvailable <= 5 && klass.slotsAvailable > 0 && (
                                    <span className="inline-block w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                        Only {klass.slotsAvailable} spot{klass.slotsAvailable > 1 ? 's' : ''} left
                                    </span>
                                )}
                            </label>
                        </div>
                    ))}
                    <ReturnButton />
                </div>
                <ContinueButton />
            </>
        )
    }
}

function ProgramCard({ program, selected = false }: { program: AcuityTypes.Api.AppointmentType; selected?: boolean }) {
    const form = useBookingForm()
    const appointmentTypeId = useWatch({ control: form.control, name: 'appointmentTypeId' })
    const { name, day, time, begins, ages } = JSON.parse(program.description)

    function handleCardClick() {
        if (appointmentTypeId) form.setValue('appointmentTypeId', null)
        else form.setValue('appointmentTypeId', program.id)
    }

    return (
        <div
            key={program.id}
            onClick={handleCardClick}
            className={cn('flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50', {
                'bg-gray-100 hover:bg-gray-100': selected,
            })}
        >
            <img
                src={program.image}
                alt={name}
                className="hidden h-20 w-20 flex-shrink-0 rounded-md object-cover min-[460px]:block"
            />

            <div className="ml-4 flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

                <div className="flex flex-wrap text-sm text-gray-500">
                    <span>{ages}</span>
                </div>

                <div className="text-sm font-semibold text-gray-700">
                    {day} · {time}
                </div>

                <div className="text-xs text-gray-500">{begins}</div>
            </div>
        </div>
    )
}
