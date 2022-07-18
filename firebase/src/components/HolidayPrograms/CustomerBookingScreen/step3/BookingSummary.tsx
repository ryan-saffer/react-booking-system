import React, { Dispatch, SetStateAction } from 'react'
import { List, Typography, Tag } from 'antd'
import { ItemSummary } from './Step3'
import { DISCOUNT_PRICE, PROGRAM_PRICE } from '../utilities'
import { Acuity } from 'fizz-kidz'

type Props = {
    summarisedItems: ItemSummary[]
    total: number
    discount: Acuity.Certificate | undefined
    originalTotal?: number
    setDiscount: Dispatch<SetStateAction<Acuity.Certificate | undefined>>
}

const BookingSummary: React.FC<Props> = ({ summarisedItems, total, discount, originalTotal, setDiscount }) => {
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
                            {discount.certificate}:{' '}
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
                    <List.Item>
                        <Typography.Text>
                            {item.name} {isDiscounted && <del>(${PROGRAM_PRICE.toFixed(2)})</del>}
                            (${(isDiscounted ? PROGRAM_PRICE - DISCOUNT_PRICE : PROGRAM_PRICE).toFixed(2)})
                        </Typography.Text>
                        {isDiscounted && <Tag color="green">All day discount: -${DISCOUNT_PRICE.toFixed(2)}</Tag>}
                    </List.Item>
                )
            }}
        ></List>
    )
}

export default BookingSummary
