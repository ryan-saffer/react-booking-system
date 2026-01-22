import { useState } from 'react'

import { SelectedProgramContext } from './selected-program.context'

import type { NullableProgram } from './selected-program.context'
import type { ReactNode } from 'react'

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
