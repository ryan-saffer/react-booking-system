import { BackButton } from './components/back-button'
import { BookingTypeSelector } from './components/booking-type-selector'
import { CasualProgramSelector } from './components/casual-program-selector'
import { StudioSelector } from './components/studio-selector'
import { TermProgramSelector } from './components/term-program-selector'

export function BookingForm() {
    return (
        <>
            <BackButton />
            <StudioSelector />
            <BookingTypeSelector />
            <TermProgramSelector />
            <CasualProgramSelector />
        </>
    )
}
