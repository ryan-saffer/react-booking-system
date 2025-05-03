import { ChevronLeft } from 'lucide-react'

import { Button } from '@ui-components/button'

import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

export function BackButton() {
    const form = useBookingForm()
    const { formStage, previousStage } = useFormStage()

    function goBack() {
        if (formStage === 'class-selection') {
            form.setValue('studio', null)
            form.setValue('appointmentTypeId', null)
        }
        previousStage()
    }

    if (formStage === 'studio-selection') return null

    return (
        <Button className="mb-4" variant="outline" size="sm" type="button" onClick={goBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    )
}
