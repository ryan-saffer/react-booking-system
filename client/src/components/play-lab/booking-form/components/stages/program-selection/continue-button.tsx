import { useCart } from '@components/play-lab/booking-form/state/cart-store'
import { useFormStage } from '@components/play-lab/booking-form/state/form-stage-store'
import { Button } from '@ui-components/button'

export function ContinueButton() {
    const selectedClasses = useCart((store) => store.selectedClasses)
    const discount = useCart((store) => store.discount)
    const nextStage = useFormStage((store) => store.nextStage)

    function renderDiscount() {
        if (discount) {
            if (discount.type === 'percentage') {
                return ` - ${discount.amount}% discount`
            } else {
                return ` - $${discount.amount.toFixed(2)} off`
            }
        } else {
            return null
        }
    }

    const numberOfSessions = Object.values(selectedClasses).length

    if (Object.values(selectedClasses).length === 0) return null

    return (
        <Button className="w-full font-semibold" type="button" onClick={nextStage}>
            Continue
            <br />
            {numberOfSessions} session
            {numberOfSessions > 1 ? 's' : ''}
            {renderDiscount()}
        </Button>
    )
}
