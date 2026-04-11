import type { AcuityTypes } from 'fizz-kidz'

import { getProgramDescriptionLines } from '../utils/program-description'

type Props = {
    program: AcuityTypes.Api.AppointmentType
    sessionCount: number
}

export function SelectedProgramSummary({ program, sessionCount }: Props) {
    const details = getProgramDescriptionLines(program)

    return (
        <div className="rounded-xl border bg-slate-50 p-4">
            <h2 className="text-lg font-semibold">{program.name}</h2>
            <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                {details.map((line) => (
                    <p key={line}>{line}</p>
                ))}
                {sessionCount > 0 ? <p>{sessionCount} sessions currently scheduled in this term.</p> : null}
                <p className="font-medium text-slate-800">No payment is collected during enrolment.</p>
            </div>
        </div>
    )
}
