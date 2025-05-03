import { create } from 'zustand'

type State = {
    formStage: FormStage
    nextStage: () => void
    previousStage: () => void
}

type FormStage = 'program-selection' | 'form'

export const useFormStage = create<State>((set, get) => ({
    formStage: 'program-selection',
    nextStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'program-selection') set({ formStage: 'form' })
    },
    previousStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'form') set({ formStage: 'program-selection' })
    },
}))
