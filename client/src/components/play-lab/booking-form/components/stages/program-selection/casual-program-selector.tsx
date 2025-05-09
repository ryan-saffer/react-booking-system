import { isSameDay, parseISO } from 'date-fns'
import { AlertCircle, CheckCircleIcon, MessageCircleWarning, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'

import Loader from '@components/Shared/Loader'
import { Calendar } from '@ui-components/calendar'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { useCartStore, type LocalAcuityClass } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm } from '../../form-schema'
import { ContinueButton } from './continue-button'
import { Separator } from '@ui-components/separator'
import { Button } from '@ui-components/button'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'

export function CasualProgramSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const selectedClasses = useCartStore((store) => store.selectedClasses)

    const studio = form.watch('studio')
    const bookingType = form.watch('bookingType')

    const minDate = useMemo(() => Date.now(), [])
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)

    const {
        data: appointmentTypes,
        isLoading: isLoadingAppointmentTypes,
        isError: isErrorAppointmentTypes,
    } = trpc.acuity.getAppointmentTypes.useQuery(
        {
            category: import.meta.env.VITE_ENV === 'prod' ? ['play-lab'] : ['play-lab-test'],
            availableToBook: false,
        },
        {
            enabled: formStage === 'program-selection',
        }
    )

    const {
        data: classes,
        isSuccess: isSuccessClasses,
        isLoading: isLoadingClasses,
        isError: isErrorClasses,
        refetch,
    } = trpc.acuity.classAvailability.useQuery(
        {
            appointmentTypeIds: appointmentTypes?.map((type) => type.id) || [],
            includeUnavailable: true,
            minDate,
        },
        {
            enabled: !!appointmentTypes && formStage === 'program-selection',
            select: (data) => data.map((it) => ({ ...it, time: parseISO(it.time) })),
        }
    )

    const filteredClasses = useMemo(
        () => (isSuccessClasses ? classes.filter((it) => it.calendar.toLowerCase().includes(studio!)) : []),
        [isSuccessClasses, classes, studio]
    )

    if (formStage !== 'program-selection') return null
    if (!bookingType || bookingType !== 'casual') return null

    if (isErrorAppointmentTypes || isErrorClasses)
        return (
            <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                    There was an error retrieving the available sessions. Please try again later.
                </AlertDescription>
            </Alert>
        )
    if (isLoadingAppointmentTypes || isLoadingClasses) return <Loader />

    if (isSuccessClasses) {
        if (filteredClasses.length === 0) {
            return (
                <Alert className="mt-4">
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>No sessions available</AlertTitle>
                    <AlertDescription>
                        Unfortunately there are no sessions available to book at the moment. Come back later and check
                        again.
                    </AlertDescription>
                </Alert>
            )
        }

        return (
            <>
                <div className="my-2 flex items-center justify-between">
                    <p className="text-md font-medium">Session Selection</p>
                    <Button variant="ghost" onClick={() => refetch()}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
                <Calendar
                    onDayClick={(day) => {
                        setSelectedDay(day)
                    }}
                    modifiers={{
                        disabled: (date) => !filteredClasses.some((klass) => isSameDay(klass.time, date)),
                        today: new Date(),
                        programSelected: (date) =>
                            Object.values(selectedClasses).some((klass) => isSameDay(klass.time, date)),
                        selected: (date) => (selectedDay ? isSameDay(date, selectedDay) : false),
                    }}
                    modifiersClassNames={{
                        disabled: 'hover:bg-white text-muted-foreground opacity-50',
                        today: 'bg-gray-100 !rounded-full',
                        programSelected: 'bg-green-200 hover:bg-green-100 !rounded-full',
                        selected: 'text-purple-600 !font-extrabold underline',
                    }}
                    styles={{
                        caption_start: { width: '100%' },
                        head_cell: {
                            width: '100%',
                        },
                        nav_button_previous: {
                            width: 40,
                        },
                        nav_button_next: {
                            width: 40,
                        },
                        caption: {
                            marginBottom: 24,
                        },
                        cell: { width: '100%', cursor: 'not-allowed', background: 'white' },
                        day: { color: '!font-semibold' },
                    }}
                />

                {selectedDay && (
                    <>
                        <Separator className="my-4" />
                        <SessionSelector classes={filteredClasses} selectedDay={selectedDay} />
                    </>
                )}
                {Object.keys(selectedClasses).length !== 0 && <ContinueButton />}
            </>
        )
    }
}

function SessionSelector({ classes, selectedDay }: { classes: LocalAcuityClass[]; selectedDay: Date }) {
    const form = useBookingForm()
    const selectedClasses = useCartStore((store) => store.selectedClasses)
    const toggleClass = useCartStore((cart) => cart.toggleClass)

    const numberOfKids = form.watch('children').length
    const bookingType = form.watch('bookingType')

    const filteredClasses = useMemo(
        () => classes.filter((it) => isSameDay(it.time, selectedDay)),
        [classes, selectedDay]
    )

    function handleSessionClick(klass: LocalAcuityClass) {
        // dont allow selecting full classes, unless it's already selected and they are trying to unselect it
        if (klass.slotsAvailable > 0 || selectedClasses[klass.id]) {
            toggleClass(klass, numberOfKids, bookingType === 'term-booking')
        }
    }

    if (!filteredClasses.length) return null

    return (
        <div className="flex flex-col gap-4">
            {filteredClasses.map((klass) => {
                const { time, color } = JSON.parse(klass.description)
                const isSelected = !!selectedClasses[klass.id]
                return (
                    <div
                        key={klass.id}
                        className={cn('relative  cursor-pointer rounded-md border p-4 hover:bg-gray-50', {
                            'border-green-300 bg-green-50 hover:bg-green-100': isSelected,
                            'cursor-not-allowed bg-slate-100 hover:bg-slate-100':
                                klass.slotsAvailable === 0 && !selectedClasses[klass.id],
                        })}
                        onClick={() => handleSessionClick(klass)}
                    >
                        <div className="w-full">
                            <p
                                className={cn('font-lilita text-lg', {
                                    'line-through': klass.slotsAvailable === 0 && !selectedClasses[klass.id],
                                })}
                                style={{ color }}
                            >
                                {klass.name}
                            </p>
                            <p
                                className={cn('text-sm font-bold', {
                                    'line-through': klass.slotsAvailable === 0 && !selectedClasses[klass.id],
                                })}
                            >
                                {klass.time.toDateString()}
                            </p>
                            <div className="flex w-full justify-between">
                                <p
                                    className={cn('text-sm', {
                                        'line-through': klass.slotsAvailable === 0 && !selectedClasses[klass.id],
                                    })}
                                >
                                    {time}
                                </p>
                                {klass.slotsAvailable <= 5 && (
                                    <p
                                        className={cn('text-sm font-semibold italic', {
                                            'text-slate-800': klass.slotsAvailable === 0,
                                        })}
                                    >
                                        {klass.slotsAvailable === 0
                                            ? 'No spots left'
                                            : `${klass.slotsAvailable} spot${klass.slotsAvailable > 1 ? 's' : ''} left`}
                                    </p>
                                )}
                            </div>
                        </div>
                        {isSelected && <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />}
                    </div>
                )
            })}
        </div>
    )
}
