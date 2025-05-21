import type { AcuityConstants } from 'fizz-kidz'
import React from 'react'

import { Form } from '../../pages/customer-booking-page'
// import { useCart } from '../../state/cart-store'
import BookingSummary from './BookingSummary'
import DiscountInput from './DiscountInput'
// import FreeConfirmationButton from './FreeConfirmationButton'
import Payment from './Payment'

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
}

const Step3: React.FC<Props> = ({ appointmentTypeId, form }) => {
    // const total = useCart((store) => store.total)

    // const isFree = total === 0
    return (
        <>
            <BookingSummary appointmentTypeId={appointmentTypeId} form={form} numberOfKids={form.children.length} />
            <DiscountInput numberOfKids={form.children.length} />
            <Payment appointmentTypeId={appointmentTypeId} form={form} />
            {/* {isFree && discount?.code && (
                <FreeConfirmationButton
                    appointmentTypeId={appointmentTypeId}
                    form={form}
                />
            )} */}
        </>
    )
}

export default Step3
