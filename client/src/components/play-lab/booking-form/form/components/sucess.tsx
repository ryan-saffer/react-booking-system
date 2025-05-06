import { CheckCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'

import { useFormStage } from '../../zustand/form-stage'

export function Success() {
    const formStage = useFormStage((store) => store.formStage)

    if (formStage !== 'success') return null

    return (
        <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Done!</AlertTitle>
            <AlertDescription className="font-medium">
                Your sessions have been booked, and should have an email confirmation any minute.
                <br />
                <br />
                We can't wait to see you soon!
            </AlertDescription>
        </Alert>
    )
}
