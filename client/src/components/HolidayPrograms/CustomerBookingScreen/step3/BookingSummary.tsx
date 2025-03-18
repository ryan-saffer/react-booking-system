import { List, Tag, Typography } from 'antd'
import type { AcuityConstants, DiscountCode } from 'fizz-kidz'
import React, { Dispatch, SetStateAction } from 'react'

import { PRICE_MAP } from '../utilities'
import { ItemSummary } from './Step3'

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    summarisedItems: ItemSummary[]
    total: number
    discount: DiscountCode | undefined
    originalTotal?: number
    setDiscount: Dispatch<SetStateAction<DiscountCode | undefined>>
}

const BookingSummary: React.FC<Props> = ({
    appointmentTypeId,
    summarisedItems,
    total,
    discount,
    originalTotal,
    setDiscount,
}) => {
    return (
        <List
            header={<Typography.Title level={4}>Booking summary</Typography.Title>}
            footer={
                <>
                    <Typography.Title level={4}>
                        Total price: {originalTotal && <del>${originalTotal.toFixed(2)}</del>} ${total.toFixed(2)}
                    </Typography.Title>
                    {discount && (
                        <Tag
                            style={{
                                fontSize: 14,
                                padding: 7,
                            }}
                            color="green"
                            closable
                            onClose={() => setDiscount(undefined)}
                        >
                            {discount.code}:{' '}
                            {discount.discountType === 'percentage'
                                ? `${discount.discountAmount}% off`
                                : `-$${discount.discountAmount.toFixed(2)}`}
                        </Tag>
                    )}
                </>
            }
            dataSource={summarisedItems}
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
}

export default BookingSummary
