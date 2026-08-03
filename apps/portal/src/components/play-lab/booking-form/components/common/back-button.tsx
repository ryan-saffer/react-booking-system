import { useIsMutating } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@ui-components/button'
import { useTRPC } from '@utils/trpc'

import { useFormStage } from '../../state/form-stage-store'

export function BackButton() {
    const { formStage, previousStage } = useFormStage()
    const trpc = useTRPC()

    const isMutating = useIsMutating({
        mutationKey: trpc.playLab.book.mutationKey(),
    })

    if (formStage === 'program-selection' || formStage === 'success') return null
    if (isMutating) return null

    return (
        <Button variant="outline" size="sm" type="button" onClick={previousStage}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
    )
}
