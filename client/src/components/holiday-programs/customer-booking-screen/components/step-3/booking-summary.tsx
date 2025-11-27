import { List, Tag, Typography } from 'antd'
import { DateTime } from 'luxon'
import React from 'react'

import type { Form } from '../../pages/customer-booking-page'
import { useCart } from '../../state/cart-store'

type Props = {
    form: Form
    numberOfKids: number
}

const BookingSummary: React.FC<Props> = ({ form, numberOfKids }) => {
    //#region Variables
    const selectedClasses = useCart((store) => store.selectedClasses)
    const subtotal = useCart((store) => store.subtotal)
    const discount = useCart((store) => store.discount)
    const totalShownToCustomer = useCart((store) => store.totalShownToCustomer)
    const clearDiscount = useCart((store) => store.clearDiscount)
    const giftCard = useCart((store) => store.giftCard)
    const clearGiftCard = useCart((store) => store.clearGiftCard)
    //#endregion

    //#region Render
    return (
        <List
            header={<Typography.Title level={4}>Booking summary</Typography.Title>}
            footer={
                <>
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
                    {giftCard && (
                        <Tag
                            style={{
                                fontSize: 14,
                                padding: 7,
                            }}
                            color="green"
                            closable
                            onClose={() => clearGiftCard(numberOfKids)}
                        >
                            Gift card applied: -${(giftCard.balanceAppliedCents / 100).toFixed(2)} ($
                            {(giftCard.balanceRemainingCents / 100).toFixed(2)} reamining)
                        </Tag>
                    )}
                    <Typography.Title level={4}>
                        Total price: {discount && <del>${subtotal.toFixed(2)}</del>} ${totalShownToCustomer.toFixed(2)}
                    </Typography.Title>
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
                            price: klass.price,
                        }
                    })
                )}
            renderItem={(item) => {
                return (
                    <List.Item style={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography.Text style={{ textAlign: 'start' }}>
                                {item.childName} - {item.dateTime}
                            </Typography.Text>
                            <Typography.Text style={{ textAlign: 'end' }}>${item.price}</Typography.Text>
                        </div>
                    </List.Item>
                )
            }}
        ></List>
    )
    //#endregion
}

export default BookingSummary
