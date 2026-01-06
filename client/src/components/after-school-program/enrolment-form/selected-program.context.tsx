import type { AcuityTypes } from 'fizz-kidz'
import { createContext } from 'react'

export type NullableProgram = AcuityTypes.Api.AppointmentType | null

export const SelectedProgramContext = createContext<{
    selectedProgram: NullableProgram
    selectProgram: (program: NullableProgram) => void
}>({
    selectedProgram: null,
    selectProgram: () => {},
})
