import { useFormStage } from '../../zustand/form-stage'

export function Payment() {
    const { formStage } = useFormStage()

    if (formStage !== 'payment') return null

    return <div>Payment!</div>
}
