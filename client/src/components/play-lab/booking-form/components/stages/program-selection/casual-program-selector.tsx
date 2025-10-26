import { isSameDay, parseISO } from 'date-fns'
import { AlertCircle, ArrowRight, CheckCircleIcon, ChevronLeft, MessageCircleWarning, RefreshCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import Loader from '@components/Shared/Loader'
import { Calendar } from '@ui-components/calendar'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { TERM_LENGTH, useCart, type LocalAcuityClass } from '../../../state/cart-store'
import { useFormStage } from '../../../state/form-stage-store'
import { useBookingForm } from '../../../state/form-schema'
import { ContinueButton } from './continue-button'
import { Separator } from '@ui-components/separator'
import { Button } from '@ui-components/button'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui-components/tabs'
import { addOrdinalSuffix, type AcuityTypes } from 'fizz-kidz'
import { Checkbox } from '@ui-components/checkbox'
import { DateTime } from 'luxon'
import { PricingStructure } from './pricing-structure'

export function CasualProgramSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const studio = form.watch('studio')
    const bookingType = form.watch('bookingType')

    const minDate = useRef(Date.now())

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
            minDate: minDate.current,
        },
        {
            enabled: !!appointmentTypes && formStage === 'program-selection',
            select: (data) => data.map((it) => ({ ...it, time: parseISO(it.time) })),
        }
    )

    const filteredClasses = useMemo(
        () =>
            isSuccessClasses
                ? classes
                      .filter((it) => it.calendar.toLowerCase().includes(studio!))
                      .map((it) => ({
                          ...it,
                          image: appointmentTypes?.find((apt) => apt.id === it.appointmentTypeID)?.image,
                      }))
                : [],
        [isSuccessClasses, classes, studio, appointmentTypes]
    )

    if (!studio) return null
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
                <PricingStructure /> {/* Temporarily placed here while hiding booking type selector  */}
                <Tabs defaultValue="program" className="">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="program">Browse by program</TabsTrigger>
                        <TabsTrigger value="date">Browse by date</TabsTrigger>
                    </TabsList>
                    <TabsContent value="program">
                        <BrowseByProgram appointmentTypes={appointmentTypes} classes={filteredClasses} />
                    </TabsContent>
                    <TabsContent value="date">
                        <BrowseByDate filteredClasses={filteredClasses} refetchClasses={refetch} />
                    </TabsContent>
                </Tabs>
            </>
        )
    }
}

function BrowseByDate({
    filteredClasses,
    refetchClasses,
}: {
    filteredClasses: LocalAcuityClass[]
    refetchClasses: () => void
}) {
    const selectedClasses = useCart((store) => store.selectedClasses)
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)

    function formatSelectedDay(date: Date) {
        const datetime = DateTime.fromJSDate(date)
        return `${datetime.toFormat('cccc')} the ${addOrdinalSuffix(datetime.get('day').toString())} of ${datetime.toFormat('LLLL')}`
    }

    return (
        <>
            <div className="my-2 flex items-center justify-between">
                <p className="text-md font-medium">Session Selection</p>
                <Button variant="ghost" onClick={() => refetchClasses()}>
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
            <Calendar
                className="mb-4"
                showOutsideDays={false}
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
                    <Separator />
                    <p className="my-4 font-semibold">{formatSelectedDay(selectedDay)}</p>
                    <SessionSelector classes={filteredClasses} selectedDay={selectedDay} />
                </>
            )}
            <ContinueButton />
        </>
    )
}

function SessionSelector({ classes, selectedDay }: { classes: LocalAcuityClass[]; selectedDay: Date }) {
    const form = useBookingForm()
    const selectedClasses = useCart((store) => store.selectedClasses)
    const toggleClass = useCart((cart) => cart.toggleClass)

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
        <div className="my-4 flex flex-col gap-4">
            {filteredClasses.map((klass) => {
                const { name, time, ages, term } = JSON.parse(klass.description)
                const isSelected = !!selectedClasses[klass.id]
                const isBookedOut = klass.slotsAvailable === 0 && !selectedClasses[klass.id]
                return (
                    <div
                        key={klass.id}
                        onClick={() => handleSessionClick(klass)}
                        className={cn(
                            'relative flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50',
                            {
                                'pointer-events-none opacity-50': isBookedOut,
                                'border-white ring-2 ring-green-400 ring-offset-2 ring-offset-white':
                                    isSelected && klass.slotsAvailable > 0,
                            }
                        )}
                    >
                        {klass.image && (
                            <img
                                src={klass.image}
                                alt={name}
                                className="hidden h-20 w-20 flex-shrink-0 rounded-md object-cover min-[460px]:block"
                            />
                        )}
                        <div className="ml-4 flex-1 space-y-1">
                            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                            <div className="flex flex-wrap text-sm text-gray-500">
                                <span>{ages}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">{time}</div>
                            {term && <div className="text-xs text-gray-400">{term}</div>}
                            {klass.slotsAvailable > 0 && klass.slotsAvailable <= 5 && (
                                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                    Only {klass.slotsAvailable} spot{klass.slotsAvailable > 1 ? 's' : ''} left
                                </span>
                            )}
                        </div>
                        {klass.slotsAvailable === 0 && (
                            <span className="absolute right-4 top-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                                Full
                            </span>
                        )}
                        {isSelected && klass.slotsAvailable > 0 && (
                            <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function BrowseByProgram({
    appointmentTypes,
    classes,
}: {
    appointmentTypes: AcuityTypes.Api.AppointmentType[]
    classes: LocalAcuityClass[]
}) {
    const form = useBookingForm()
    const selectedClasses = useCart((store) => store.selectedClasses)
    const toggleClass = useCart((store) => store.toggleClass)
    const setSelectedClasses = useCart((store) => store.setSelectedClasses)

    const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<number | null>(null)

    const filteredClasses = useMemo(
        () =>
            selectedAppointmentTypeId ? classes.filter((it) => it.appointmentTypeID === selectedAppointmentTypeId) : [],
        [selectedAppointmentTypeId, classes]
    )

    const groupedPrograms = useMemo(() => {
        const groups: Record<string, AcuityTypes.Api.AppointmentType[]> = {}

        appointmentTypes.forEach((program) => {
            // Only include programs that have available classes
            const hasAvailableClasses = classes.some((klass) => klass.appointmentTypeID === program.id)
            if (!hasAvailableClasses) return

            try {
                const description = JSON.parse(program.description)
                const term = description.term || 'Other Programs'

                if (!groups[term]) {
                    groups[term] = []
                }
                groups[term].push(program)
            } catch (error) {
                // If JSON parsing fails, group under "Other Programs"
                if (!groups['Other Programs']) {
                    groups['Other Programs'] = []
                }
                groups['Other Programs'].push(program)
            }
        })

        return groups
    }, [appointmentTypes, classes])

    function handleCardClick(id: number) {
        if (selectedAppointmentTypeId === id) setSelectedAppointmentTypeId(null)
        else setSelectedAppointmentTypeId(id)
    }

    function selectAllClasses() {
        setSelectedClasses(filteredClasses, form.getValues().children.length)
    }

    return (
        <>
            <div className="flex flex-col gap-6">
                {Object.entries(groupedPrograms)
                    .sort(([a], [b]) => {
                        const aIsTerm = a.toLowerCase().startsWith('term')
                        const bIsTerm = b.toLowerCase().startsWith('term')

                        if (aIsTerm && !bIsTerm) return -1
                        if (!aIsTerm && bIsTerm) return 1

                        return a.localeCompare(b, undefined, { sensitivity: 'base' })
                    })
                    .map(([term, programs]) => {
                        // Check if any programs in this term group should be shown
                        const hasVisiblePrograms = programs.some(
                            (program) => !selectedAppointmentTypeId || selectedAppointmentTypeId === program.id
                        )

                        if (!hasVisiblePrograms) return null

                        return (
                            <div key={term}>
                                <h3 className="mb-3 mt-2 text-lg font-semibold text-gray-800">{term}</h3>
                                <div className="flex flex-col gap-4">
                                    {programs.map((program) => {
                                        const includesSelectedClass = Object.values(selectedClasses).some(
                                            (it) => it.appointmentTypeID === program.id
                                        )

                                        const { name, day, time, ages } = JSON.parse(program.description)

                                        if (selectedAppointmentTypeId && selectedAppointmentTypeId !== program.id)
                                            return null

                                        return (
                                            <div
                                                key={program.id}
                                                onClick={() => handleCardClick(program.id)}
                                                className={cn(
                                                    'relative flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50',
                                                    {
                                                        'bg-gray-100 hover:bg-gray-100':
                                                            selectedAppointmentTypeId === program.id,
                                                        'border-white ring-2 ring-green-400 ring-offset-2 ring-offset-white':
                                                            includesSelectedClass &&
                                                            selectedAppointmentTypeId !== program.id,
                                                    }
                                                )}
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
                                                </div>
                                                {includesSelectedClass && selectedAppointmentTypeId !== program.id && (
                                                    <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
            </div>
            <div className="mb-4">
                {selectedAppointmentTypeId && filteredClasses.length !== 0 && (
                    <>
                        {filteredClasses.length === TERM_LENGTH && (
                            <Button
                                className="mt-6 w-full border-2 border-[#4BC5D9]"
                                variant="outline"
                                onClick={selectAllClasses}
                            >
                                Enrol into the entire term
                                <ArrowRight className="ml-2 h-4 w-4" />
                                <span className="ml-4 rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900">
                                    20% OFF
                                </span>
                            </Button>
                        )}
                        <div className="mt-4 flex flex-col gap-4">
                            {filteredClasses.map((klass) => (
                                <div key={klass.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${klass.id}`}
                                        disabled={klass.slotsAvailable === 0}
                                        checked={!!selectedClasses[klass.id]}
                                        onCheckedChange={() =>
                                            toggleClass(
                                                klass,
                                                form.getValues().children.length,
                                                form.getValues().bookingType === 'term-booking'
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor={`${klass.id}`}
                                        className="flex cursor-pointer flex-col gap-1 text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                                                Only {klass.slotsAvailable} spot{klass.slotsAvailable > 1 ? 's' : ''}{' '}
                                                left
                                            </span>
                                        )}
                                    </label>
                                </div>
                            ))}
                            <ReturnButton onClick={() => setSelectedAppointmentTypeId(null)} />
                        </div>
                    </>
                )}
                {selectedAppointmentTypeId && filteredClasses.length === 0 && (
                    <>
                        <Alert className="mt-4">
                            <MessageCircleWarning className="h-4 w-4" />
                            <AlertTitle>No sessions available</AlertTitle>
                            <AlertDescription>
                                This program does not have any sessions available at the moment. Try selecting another
                                program.
                            </AlertDescription>
                        </Alert>
                        <ReturnButton onClick={() => setSelectedAppointmentTypeId(null)} />
                    </>
                )}
            </div>
            <ContinueButton />
        </>
    )
}

function ReturnButton({ onClick }: { onClick: () => void }) {
    return (
        <Button variant="outline" className="mt-2 w-full" onClick={onClick}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Return to all programs
        </Button>
    )
}
