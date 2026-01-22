import { createContext } from 'react'

import type { AcuityTypes } from 'fizz-kidz'

export type NullableProgram = AcuityTypes.Api.AppointmentType | null

export const SelectedProgramContext = createContext<{
    selectedProgram: NullableProgram
    selectProgram: (program: NullableProgram) => void
}>({
    selectedProgram: null,
    selectProgram: () => {},
})
