import type { ReactNode } from 'react'
import { useState } from 'react'
import type { NullableProgram } from './selected-program.context'
import { SelectedProgramContext } from './selected-program.context'

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
