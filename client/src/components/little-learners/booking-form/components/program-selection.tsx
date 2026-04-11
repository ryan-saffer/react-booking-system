import { MessageCircleWarning } from 'lucide-react'

import type { AcuityTypes } from 'fizz-kidz'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@ui-components/card'

import { useEnrolmentStore } from '../state/enrolment-store'
import { getProgramDescriptionLines } from '../utils/program-description'

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
                    const details = getProgramDescriptionLines(program)

                    return (
                        <Card
                            key={program.id}
                            onClick={() => setSelectedProgram(program)}
                            className="cursor-pointer border-slate-200 shadow-sm transition hover:bg-slate-50"
                        >
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">{program.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    {details.length > 0 ? (
                                        details.map((line) => (
                                            <p key={line} className="text-sm text-muted-foreground">
                                                {line}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Select this program to continue.
                                        </p>
                                    )}
                                </div>
                                {program.image ? (
                                    <img
                                        src={program.image}
                                        alt={program.name}
                                        className="h-20 w-20 rounded-md object-cover"
                                    />
                                ) : null}
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                <Alert>
                    <MessageCircleWarning className="h-4 w-4" />
                    <AlertTitle>No programs available</AlertTitle>
                    <AlertDescription>
                        There are no Little Learners programs available for this studio right now.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
