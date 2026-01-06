import type { AcuityTypes } from 'fizz-kidz'
import type { ReactNode } from 'react'
import { createContext, useState } from 'react'

type NullableProgram = AcuityTypes.Api.AppointmentType | null

export const SelectedProgramContext = createContext<{
    selectedProgram: NullableProgram
    selectProgram: (program: NullableProgram) => void
}>({
    selectedProgram: null,
    selectProgram: () => {},
})

export function SelectedProgramProvider({ children }: { children: ReactNode }) {
    const [selectedProgram, setSelectedProgram] = useState<NullableProgram>(null)

    return (
        <SelectedProgramContext
            value={{
                selectedProgram,
                selectProgram: setSelectedProgram,
            }}
        >
            {children}
        </SelectedProgramContext>
    )
}
