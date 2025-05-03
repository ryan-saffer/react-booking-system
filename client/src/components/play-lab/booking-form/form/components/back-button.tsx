import { ChevronLeft } from 'lucide-react'

import { Button } from '@ui-components/button'

import { useFormStage } from '../../zustand/form-stage'

export function BackButton() {
    const { formStage, previousStage } = useFormStage()

    function goBack() {
        previousStage()
    }

    if (formStage === 'program-selection') return null

    return (
        <Button className="mb-4" variant="outline" size="sm" type="button" onClick={goBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    )
}
