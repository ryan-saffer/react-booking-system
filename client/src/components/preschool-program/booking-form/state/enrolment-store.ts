import { create } from 'zustand'

import type { AcuityTypes, StudioOrTest } from 'fizz-kidz'

type FormStage = 'program-selection' | 'form' | 'success'

type State = {
    formStage: FormStage
    selectedStudio: StudioOrTest | null
    selectedProgram: AcuityTypes.Api.AppointmentType | null
    minDate: number
    setSelectedStudio: (studio: StudioOrTest) => void
    setSelectedProgram: (program: AcuityTypes.Api.AppointmentType | null) => void
    previousStage: () => void
    showSuccess: () => void
}

export const useEnrolmentStore = create<State>((set) => ({
    formStage: 'program-selection',
    selectedStudio: null,
    selectedProgram: null,
    minDate: Date.now(),
    setSelectedStudio: (studio) => {
        set({ selectedStudio: studio, selectedProgram: null, formStage: 'program-selection' })
        scrollToTop()
    },
    setSelectedProgram: (program) => {
        set({ selectedProgram: program, formStage: program ? 'form' : 'program-selection' })
        scrollToTop()
    },
    previousStage: () => {
        set({ selectedProgram: null, formStage: 'program-selection' })
        scrollToTop()
    },
    showSuccess: () => {
        set({ formStage: 'success' })
        scrollToTop()
    },
}))

function scrollToTop() {
    window.scrollTo({ top: 170, behavior: 'instant' })
}
