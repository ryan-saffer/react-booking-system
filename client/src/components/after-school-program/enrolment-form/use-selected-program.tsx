import { useContext } from 'react'

import { SelectedProgramContext } from './selected-program-context'

export function useSelectedProgram() {
    return useContext(SelectedProgramContext)
}
