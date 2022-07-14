import React from 'react'
import { Acuity } from 'fizz-kidz'
import { List, Typography, Tag } from 'antd'
import { DateTime } from 'luxon'
import { Form, PROGRAM_PRICE } from '.'

type Props = {
    form: Form
    selectedClasses: Acuity.Class[]
    discountedClasses: number[]
    total: number
    originalTotal?: number
}

type ChildForm = {
    childName: string
}

const BookingSummary: React.FC<Props> = ({ form, selectedClasses, discountedClasses, total, originalTotal }) => {
    let dataSource: { name: string; discounted: boolean }[] = []
    selectedClasses.forEach((klass) => {
        form['children'].forEach((child: ChildForm) => {
            const dateTime = DateTime.fromISO(klass.time).toLocaleString({
                weekday: 'long',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            dataSource.push({
                name: `${child.childName} - ${dateTime}`,
                discounted: discountedClasses.includes(klass.id),
            })
        })
    })

    return (
        <List
            header={<Typography.Title level={4}>Booking summary</Typography.Title>}
            footer={<Typography.Title level={4}>
                Total price:{' '}
                {originalTotal && <del>${originalTotal}.00</del>}{' '}
                ${total}.00
            </Typography.Title>}
            dataSource={dataSource}
            renderItem={(item) => (
                <List.Item>
                    <Typography.Text>
                        {item.name}{' '}
                        {item.discounted && <del>(${PROGRAM_PRICE}.00)</del>}
                        (${item.discounted ? PROGRAM_PRICE - 5 : PROGRAM_PRICE}.00)
                    </Typography.Text>
                    {item.discounted && <Tag color="green">All day discount: -$5.00</Tag>}
                </List.Item>
            )}
        ></List>
    )
}

export default BookingSummary
