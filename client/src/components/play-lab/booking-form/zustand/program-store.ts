import type { AcuityTypes } from 'fizz-kidz'
import { create } from 'zustand'

export type LocalAcuityClass = Omit<AcuityTypes.Api.Class, 'time'> & { time: Date }

interface State {
    selectedClasses: Record<number, LocalAcuityClass>
    toggleClass: (klass: LocalAcuityClass) => void
}

export const useProgramStore = create<State>()((set, get) => ({
    selectedClasses: {},
    toggleClass: (klass) => {
        const selectedClasses = get().selectedClasses
        if (selectedClasses[klass.id]) {
            delete selectedClasses[klass.id]
            set({ selectedClasses })
        } else {
            set({ selectedClasses: { ...selectedClasses, [klass.id]: klass } })
        }
    },
}))
