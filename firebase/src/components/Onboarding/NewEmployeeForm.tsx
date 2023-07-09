import { Button, DatePicker, Form, Input, InputNumber, Modal, Typography } from 'antd'
import React, { useState } from 'react'
import { Dayjs } from 'dayjs'

type TNewEmployeeForm = {
    firstName: string
    lastName: string
    mobile: string
    email: string
    baseWage: number
    position: string
    commencementDate: Dayjs
    managerName: string
    managerPosition: string
    senderName: string
    senderPosition: string
}

type Props = {
    open: boolean
    onCancel: () => void
}

const NewEmployeeForm: React.FC<Props> = ({ open, onCancel }) => {
    const [form] = Form.useForm<TNewEmployeeForm>()

    const [submitting, setSubmitting] = useState(false)

    const submit = async () => {
        try {
            const values = await form.validateFields()
            const formattedValues = {
                ...values,
                commencementDate: values.commencementDate.format('YYYY-MM-DD'),
            }
            console.log(formattedValues)
            setSubmitting(true)
            setTimeout(() => {
                onCancel()
                form.resetFields()
                setSubmitting(false)
            }, 3000)
        } catch {
            return
        }
    }

    const cancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            open={open}
            maskClosable={false}
            onCancel={cancel}
            width={700}
            footer={[
                <Button key="cancel" onClick={cancel}>
                    Close
                </Button>,
                <Button key="submit" type="primary" onClick={submit} loading={submitting}>
                    Submit
                </Button>,
            ]}
        >
            <div style={{ padding: '0 16px' }}>
                <Typography.Title level={4}>Onboard new employee</Typography.Title>
                <Form form={form} layout="vertical" size="middle">
                    <Form.Item label="Name" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Form.Item
                            name="firstName"
                            rules={[{ required: true, message: 'Please enter First Name' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                        >
                            <Input placeholder="First Name" />
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            rules={[{ required: true, message: 'Please enter Last Name' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                        >
                            <Input placeholder="Last Name" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Email is not valid' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="position" label="Position" rules={[{ required: true }]}>
                        <Input placeholder="Party Facilitator" />
                    </Form.Item>
                    <Form.Item
                        name="baseWage"
                        label="Base Wage"
                        rules={[{ required: true }]}
                        extra={
                            <>
                                Mon - Sat rate will be base wage * 1.25
                                <br />
                                Sunday rate wil be base wage * 1.75
                            </>
                        }
                    >
                        <InputNumber precision={2} addonBefore="$" />
                    </Form.Item>
                    <Form.Item
                        name="commencementDate"
                        label="Commencement Date"
                        rules={[{ type: 'object' as const, required: true }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        label="Manager"
                        rules={[{ required: true }]}
                        extra="Name and position of the employees manager"
                    >
                        <Form.Item
                            name="managerName"
                            rules={[{ required: true, message: 'Please enter Manager Name' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: 0 }}
                        >
                            <Input placeholder="Manager name" />
                        </Form.Item>
                        <Form.Item
                            name="managerPosition"
                            rules={[{ required: true, message: 'Please enter Manager Position' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                        >
                            <Input placeholder="Manager Position" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item
                        label="Sender"
                        rules={[{ required: true }]}
                        extra="Name and position of the person listed at the bottom of the contract"
                    >
                        <Form.Item
                            name="senderName"
                            rules={[{ required: true, message: 'Please enter Sender Name' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: 0 }}
                        >
                            <Input placeholder="Sender Name" />
                        </Form.Item>
                        <Form.Item
                            name="senderPosition"
                            rules={[{ required: true, message: 'Please enter Sender Position' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                        >
                            <Input placeholder="Sender Position" />
                        </Form.Item>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}

export default NewEmployeeForm
