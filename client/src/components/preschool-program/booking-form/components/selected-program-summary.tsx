import { capitalise } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import { Card, CardContent, CardHeader, CardTitle } from '@ui-components/card'

import { useEnrolmentStore } from '../state/enrolment-store'

type Props = {
    program: AcuityTypes.Api.AppointmentType
    sessionCount: number
}

export function SelectedProgramSummary({ program, sessionCount }: Props) {
    const selectedStudio = useEnrolmentStore((store) => store.selectedStudio)
    const { time, dates, term } = JSON.parse(program.description)

    return (
        <Card className="border-violet-100 bg-violet-50/30 shadow-sm">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-4 border-b border-violet-100 pb-3">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Selected Program</p>
                        <CardTitle className="text-base font-medium">Preschool Program - {term}</CardTitle>
                        <p className="mt-2 text-lg font-bold  ">{time}</p>
                    </div>
                    <p className="rounded-full bg-white px-3 py-1 text-sm font-medium  shadow-sm">
                        {capitalise(selectedStudio || '')}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-0 text-sm text-slate-600">
                <p>
                    <span className="font-medium"> {dates}</span>
                </p>
                <p>
                    <span className="font-medium">Studio: </span>
                    {capitalise(selectedStudio || '')}
                </p>
                {sessionCount > 0 ? <p>{sessionCount} sessions currently scheduled in this term.</p> : null}
                <p className="font-medium text-slate-800">No payment is collected during enrolment.</p>
            </CardContent>
        </Card>
    )
}
