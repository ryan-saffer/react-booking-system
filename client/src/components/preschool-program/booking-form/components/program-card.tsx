import { CalendarRange, MapPin } from 'lucide-react'

import { capitalise } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import { Card, CardContent, CardHeader } from '@ui-components/card'
import { cn } from '@utils/tailwind'

import type { ReactNode } from 'react'

type Props = {
    program: AcuityTypes.Api.AppointmentType
    studio: string
    heading?: string
    footer?: ReactNode
    onClick?: () => void
}

type ProgramDescription = {
    time: string
    dates: string
    term: string
}

export function ProgramCard({ program, studio, heading, footer, onClick }: Props) {
    const { time, dates, term } = JSON.parse(program.description) as ProgramDescription

    return (
        <Card
            onClick={onClick}
            className={cn(
                'border-violet-100 bg-violet-50/30 shadow-sm',
                onClick && 'cursor-pointer transition hover:border-violet-200 hover:bg-violet-50/60 hover:shadow-md'
            )}
        >
            <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-4 border-b border-violet-100 pb-3">
                    <div>
                        {heading ? <p className="text-sm font-medium text-slate-500">{heading}</p> : null}
                        <p className={cn('text-lg font-bold', heading && 'mt-2')}>
                            {term}: {time}
                        </p>
                    </div>
                    <p className="rounded-full bg-white px-3 py-1 text-sm font-medium shadow-sm">
                        {capitalise(studio)}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-0 text-sm text-slate-600">
                <p className="flex items-center">
                    <CalendarRange className="mr-2 h-4 w-4 text-violet-800" />
                    <span className="font-medium">{dates}</span>
                </p>
                <p className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-violet-800" />
                    <span className="font-medium">Studio: {capitalise(studio)}</span>
                </p>
                {footer}
            </CardContent>
        </Card>
    )
}
