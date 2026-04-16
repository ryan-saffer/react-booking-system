import { CalendarRange, MessageCircleWarning } from 'lucide-react'

import type { AcuityTypes } from 'fizz-kidz'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'

import { ProgramCard } from './program-card'
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
            <h2 className="flex items-center text-lg font-medium">
                <CalendarRange className="mr-2 h-5 w-5 text-violet-800" />
                Select your program:
            </h2>

            {programs.length > 0 ? (
                programs.map((program) => (
                    <ProgramCard
                        key={program.id}
                        program={program}
                        studio={selectedStudio}
                        onClick={() => setSelectedProgram(program)}
                        footer={<p className="mt-1">Select this program to continue.</p>}
                    />
                ))
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
