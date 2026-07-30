import { create } from 'zustand'

type FormStage = 'program-selection' | 'form' | 'payment' | 'success'

type State = {
    formStage: FormStage
    nextStage: () => void
    previousStage: () => void
}

export const useFormStage = create<State>((set, get) => ({
    formStage: 'program-selection',
    nextStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'program-selection') {
            set({ formStage: 'form' })
            scrollToTop()
        } else if (currentStage === 'form') {
            set({ formStage: 'payment' })
            scrollToTop()
        } else if (currentStage === 'payment') {
            set({ formStage: 'success' })
            scrollToTop()
        }
    },
    previousStage: () => {
        const currentStage = get().formStage
        if (currentStage === 'form') {
            set({ formStage: 'program-selection' })
            scrollToTop()
        } else if (currentStage === 'payment') {
            set({ formStage: 'form' })
            scrollToTop()
        }
    },
}))

/** Returns the booking page to the top after a stage transition. */
function scrollToTop() {
    window.scrollTo({ top: 170, behavior: 'instant' })
}
