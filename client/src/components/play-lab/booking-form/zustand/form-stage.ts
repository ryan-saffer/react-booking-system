import { create } from 'zustand'

type State = {
    formStage: FormStage
    nextStage: () => void
    previousStage: () => void
}

type FormStage = 'program-selection' | 'form' | 'payment' | 'success'

export const useFormStage = create<State>((set, get) => ({
    formStage: 'program-selection',
    nextStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'program-selection') {
            set({ formStage: 'form' })
            window.scrollTo({ top: 170, behavior: 'instant' })
        } else if (currentStage === 'form') {
            set({ formStage: 'payment' })
            window.scrollTo({ top: 170, behavior: 'instant' })
        } else if (currentStage === 'payment') {
            set({ formStage: 'success' })
            window.scrollTo({ top: 170, behavior: 'instant' })
        }
    },
    previousStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'form') {
            set({ formStage: 'program-selection' })
            window.scrollTo({ top: 170, behavior: 'instant' })
        } else if (currentStage === 'payment') {
            set({ formStage: 'form' })
            window.scrollTo({ top: 170, behavior: 'instant' })
        }
    },
}))
