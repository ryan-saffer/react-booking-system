import { List, Tag, Typography } from 'antd'
import type { AcuityConstants } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React from 'react'

import type { Form } from '../../pages/customer-booking-page'
import { useCart } from '../../state/cart-store'
import { PRICE_MAP } from '../../utilities'

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
    numberOfKids: number
}

const BookingSummary: React.FC<Props> = ({ appointmentTypeId, form, numberOfKids }) => {
    //#region Variables
    const selectedClasses = useCart((store) => store.selectedClasses)
    const subtotal = useCart((store) => store.subtotal)
    const discount = useCart((store) => store.discount)
    const total = useCart((store) => store.total)
    const clearDiscount = useCart((store) => store.clearDiscount)
    //#endregion

    //#region Render
    return (
        <List
            header={<Typography.Title level={4}>Booking summary</Typography.Title>}
            footer={
                <>
                    <Typography.Title level={4}>
                        Total price: {discount && <del>${subtotal.toFixed(2)}</del>} ${total.toFixed(2)}
                    </Typography.Title>
                    {discount && (
                        <Tag
                            style={{
                                fontSize: 14,
                                padding: 7,
                            }}
                            color="green"
                            closable
                            onClose={() => clearDiscount(numberOfKids)}
                        >
                            {discount.code}:{' '}
                            {discount.discountType === 'percentage'
                                ? `${discount.discountAmount}% off`
                                : `-$${discount.discountAmount.toFixed(2)}`}
                        </Tag>
                    )}
                </>
            }
            dataSource={Object.values(selectedClasses)
                .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0))
                .flatMap((klass) =>
                    form['children'].map((child) => {
                        const dateTime = DateTime.fromISO(klass.time).toLocaleString({
                            weekday: 'short',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })
                        return {
                            childName: child.childName,
                            dateTime: dateTime,
                            discounted: false, // hardcoded for now - used to be if this class had a 'same day discount'
                        }
                    })
                )}
            renderItem={(item) => {
                const isDiscounted = discount === undefined && item.discounted
                return (
                    <List.Item style={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography.Text style={{ textAlign: 'start' }}>
                                {item.childName} - {item.dateTime}
                            </Typography.Text>
                            <Typography.Text style={{ textAlign: 'end' }}>
                                $
                                {(isDiscounted
                                    ? PRICE_MAP[appointmentTypeId].PROGRAM_PRICE -
                                      PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE
                                    : PRICE_MAP[appointmentTypeId].PROGRAM_PRICE
                                ).toFixed(2)}{' '}
                                {isDiscounted && <del>(${PRICE_MAP[appointmentTypeId].PROGRAM_PRICE.toFixed(2)})</del>}
                            </Typography.Text>
                        </div>
                        {isDiscounted && (
                            <Tag color="green" style={{ marginTop: 4 }}>
                                All day discount: -${PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE.toFixed(2)}
                            </Tag>
                        )}
                    </List.Item>
                )
            }}
        ></List>
    )
    //#endregion
}

export default BookingSummary
