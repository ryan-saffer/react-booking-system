import { isSameDay, parseISO } from 'date-fns'
import { CheckCircleIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useState } from 'react'

import Loader from '@components/Shared/Loader'
import { Calendar } from '@ui-components/calendar'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { useCartStore, type LocalAcuityClass } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm } from '../../form-schema'
import { FormLabel } from '@ui-components/form'
import { ContinueButton } from './continue-button'
import { Separator } from '@ui-components/separator'

export function CasualProgramSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const selectedClasses = useCartStore((store) => store.selectedClasses)

    const bookingType = form.watch('bookingType')

    const minDate = useMemo(() => Date.now(), [])
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)

    const {
        data: appointmentTypes,
        isLoading: isLoadingAppointmentTypes,
        isError: isErrorAppointmentTypes,
    } = trpc.acuity.getAppointmentTypes.useQuery(
        {
            category: ['play-lab-test'],
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

    if (formStage !== 'program-selection') return null
    if (!bookingType || bookingType !== 'casual') return null

    if (isLoadingAppointmentTypes || isLoadingClasses) return <Loader />
    if (isErrorAppointmentTypes || isErrorClasses) return <p>Error</p>

    if (isSuccessClasses) {
        return (
            <>
                <FormLabel className="text-md">Session Selection</FormLabel>
                <Calendar
                    onDayClick={(day) => {
                        setSelectedDay(day)
                    }}
                    modifiers={{
                        disabled: (date) => !classes.some((klass) => isSameDay(klass.time, date)),
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
                        cell: { width: '100%', cursor: 'not-allowed', background: 'white' },
                        day: { color: '!font-semibold' },
                    }}
                />
                {selectedDay && <SessionSelector classes={classes} selectedDay={selectedDay} />}
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

    if (!filteredClasses.length) return null

    return (
        <>
            <Separator className="my-4" />
            <div className="flex flex-col gap-4">
                {filteredClasses.map((klass) => {
                    const { time, color } = JSON.parse(klass.description)
                    const isSelected = !!selectedClasses[klass.id]
                    return (
                        <div
                            key={klass.id}
                            className={cn(
                                'flex cursor-pointer items-center justify-between rounded-md border p-4 hover:bg-gray-50',
                                {
                                    'border-green-300 bg-green-50 hover:bg-green-100': isSelected,
                                }
                            )}
                            onClick={() => toggleClass(klass, numberOfKids, bookingType === 'term-booking')}
                        >
                            <div>
                                <p className="font-lilita text-lg" style={{ color }}>
                                    {klass.name}
                                </p>
                                <p className="text-sm font-bold">{klass.time.toDateString()}</p>
                                <p className="text-sm">{time}</p>
                            </div>
                            {isSelected && <CheckCircleIcon className="mr-6 h-6 w-6 text-green-500" />}
                        </div>
                    )
                })}
            </div>
        </>
    )
}
