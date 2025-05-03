import { create } from 'zustand'

type State = {
    formStage: FormStage
    nextStage: () => void
    previousStage: () => void
}

type FormStage = 'studio-selection' | 'appointment-type-selection' | 'class-selection'

export const useFormStage = create<State>((set, get) => ({
    formStage: 'studio-selection',
    nextStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'studio-selection') set({ formStage: 'class-selection' })
        else if (currentStage === 'appointment-type-selection') set({ formStage: 'class-selection' })
    },
    previousStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'class-selection') set({ formStage: 'appointment-type-selection' })
    },
}))
