import { useCartStore } from '@components/play-lab/booking-form/zustand/cart-store'
import { useFormStage } from '@components/play-lab/booking-form/zustand/form-stage'
import { Button } from '@ui-components/button'

export function ContinueButton() {
    const selectedClasses = useCartStore((store) => store.selectedClasses)
    const discount = useCartStore((store) => store.discount)
    const nextStage = useFormStage((store) => store.nextStage)

    function renderDiscount() {
        if (discount) {
            if (discount.type === 'percentage') {
                return ` - ${discount.amount * 100}% discount`
            } else {
                return ` - $${discount.amount.toFixed(2)}`
            }
        } else {
            return null
        }
    }

    const numberOfSessions = Object.values(selectedClasses).length

    return (
        <Button className="mt-4 w-full font-semibold" type="button" onClick={nextStage}>
            Continue
            <br />
            {numberOfSessions} session
            {numberOfSessions > 1 ? 's' : ''}
            {renderDiscount()}
        </Button>
    )
}
