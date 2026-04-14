import { MessageCircleWarning } from 'lucide-react'

import { capitalise } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@ui-components/card'

import { useEnrolmentStore } from '../state/enrolment-store'

type Props = {
    programs: AcuityTypes.Api.AppointmentType[]
}

export function ProgramSelection({ programs }: Props) {
    const selectedStudio = useEnrolmentStore((store) => store.selectedStudio)
    const setSelectedProgram = useEnrolmentStore((store) => store.setSelectedProgram)

    if (!selectedStudio) return null

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Select your program</h2>

            {programs.length > 0 ? (
                programs.map((program) => {
                    const { time, dates, term } = JSON.parse(program.description)

                    return (
                        <Card
                            key={program.id}
                            onClick={() => setSelectedProgram(program)}
                            className="cursor-pointer border-violet-100 bg-violet-50/30 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/60 hover:shadow-md"
                        >
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex items-start justify-between gap-4 border-b border-violet-100 pb-3">
                                    <div>
                                        <CardTitle className="text-base font-medium">
                                            Preschool Program - {term}
                                        </CardTitle>
                                        <p className="mt-2 text-lg font-bold  ">{time}</p>
                                    </div>
                                    <p className="rounded-full bg-white px-3 py-1 text-sm font-medium  shadow-sm">
                                        {capitalise(selectedStudio)}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0 text-sm text-slate-600">
                                <p>
                                    <span className="font-medium"> {dates}</span>
                                </p>
                                <p>
                                    <span className="font-medium">Studio: </span>
                                    {capitalise(selectedStudio)}
                                </p>

                                <p>Select this program to continue.</p>
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                <Alert>
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>No programs available</AlertTitle>
                    <AlertDescription>
                        There are no preschool programs available for this studio right now.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
