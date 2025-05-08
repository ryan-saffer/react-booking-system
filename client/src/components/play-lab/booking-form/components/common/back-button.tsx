import { ChevronLeft } from 'lucide-react'

import { useIsMutating } from '@tanstack/react-query'
import { Button } from '@ui-components/button'

import { useFormStage } from '../../zustand/form-stage'

export function BackButton() {
    const { formStage, previousStage } = useFormStage()

    const isMutating = useIsMutating()

    if (formStage === 'program-selection' || formStage === 'success') return null
    if (isMutating) return null

    return (
        <Button variant="outline" size="sm" type="button" onClick={previousStage}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    )
}
