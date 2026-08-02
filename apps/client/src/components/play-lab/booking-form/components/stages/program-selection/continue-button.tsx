import { PRICING_STRUCTURE, useCart } from '@components/play-lab/booking-form/state/cart-store'
import { useFormStage } from '@components/play-lab/booking-form/state/form-stage-store'
import { Button } from '@ui-components/button'

export function ContinueButton() {
    const selectedClasses = useCart((store) => store.selectedClasses)
    const discount = useCart((store) => store.discount)
    const nextStage = useFormStage((store) => store.nextStage)

    const numberOfSessions = Object.values(selectedClasses).length

    function renderDiscount() {
        if (numberOfSessions === 1) {
            return ` - $${PRICING_STRUCTURE[0].price} / session`
        }
        if (discount) {
            if (discount.isMultiSessionDiscount) {
                let result = ''
                PRICING_STRUCTURE.forEach(({ minSessions, price }) => {
                    if (numberOfSessions >= minSessions) {
                        result = ` - $${price} / session`
                    }
                })
                return result
            } else {
                if (discount.type === 'percentage') {
                    return ` - ${discount.amount}% discount`
                } else {
                    return ` - $${discount.amount.toFixed(2)} off`
                }
            }
        } else {
            return null
        }
    }

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
