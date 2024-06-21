import { AcuityTypes } from 'fizz-kidz'
import { ReactNode, createContext, useState } from 'react'

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
        <SelectedProgramContext.Provider
            value={{
                selectedProgram,
                selectProgram: setSelectedProgram,
            }}
        >
            {children}
        </SelectedProgramContext.Provider>
    )
}
