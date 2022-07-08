import React from 'react'
import { Acuity } from 'fizz-kidz'
import { List, FormInstance, Typography } from 'antd'
import { DateTime } from 'luxon'
import { Form, PROGRAM_PRICE } from '.'

type Props = {
    form: Form
    selectedClasses: Acuity.Class[]
    total: number
}

type ChildForm = {
    childName: string
}

const BookingSummary: React.FC<Props> = ({ form, selectedClasses, total }) => {

    let dataSource: string[] = []
    selectedClasses.forEach(klass => {
        form['children'].forEach((child: ChildForm) => {
            const dateTime = DateTime.fromISO(klass.time).toLocaleString({
                weekday: 'long',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
            dataSource.push(`${child.childName} - ${dateTime} ($${PROGRAM_PRICE}.00)`)
        })
    })

    return (
        <List
            header={<Typography.Title level={4}>Booking summary</Typography.Title>}
            footer={<Typography.Title level={4}>Total price: ${total / 100}.00</Typography.Title>}
            dataSource={dataSource}
            renderItem={item => (
                <List.Item>
                    <Typography.Text>{item}</Typography.Text>
                </List.Item>
            )}
        ></List>
    )
}

export default BookingSummary
