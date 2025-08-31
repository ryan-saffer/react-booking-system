import { CheckCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'

import { useFormStage } from '../../../state/form-stage-store'

export function Success() {
    const formStage = useFormStage((store) => store.formStage)

    if (formStage !== 'success') return null

    return (
        <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Booked!</AlertTitle>
            <AlertDescription className="font-medium">
                Your sessions have been booked, and you should have an email confirmation any second.
                <br />
                <br />
                We can't wait to see you soon!
            </AlertDescription>
        </Alert>
    )
}
