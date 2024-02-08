import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Typography, message } from 'antd'
import { Dayjs } from 'dayjs'
import { Location } from 'fizz-kidz'
import React, { useState } from 'react'

import { capitalise } from '@utils/stringUtilities'
import { trpc } from '@utils/trpc'

const { Option } = Select

type TNewEmployeeForm = {
    firstName: string
    lastName: string
    mobile: string
    email: string
    position: string
    customPosition?: string
    commencementDate: Dayjs
    location: Location
    normalRate: number
    sundayRate: number
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
    const [messageApi] = message.useMessage()

    const [submitting, setSubmitting] = useState(false)

    const initiateOnboardingMutation = trpc.staff.initiateOnboarding.useMutation()

    const submit = async () => {
        try {
            const values = await form.validateFields()
            const formattedValues = {
                ...values,
                commencementDate: values.commencementDate.format('YYYY-MM-DD'),
            }
            if (formattedValues.position === 'other') {
                formattedValues.position = formattedValues.customPosition!
            }
            setSubmitting(true)
            try {
                await initiateOnboardingMutation.mutateAsync(formattedValues)
                onCancel()
                form.resetFields()
            } catch (err) {
                console.error(err)
                messageApi.open({
                    type: 'error',
                    content: 'There was an error creating the employee',
                    duration: 5,
                })
            } finally {
                setSubmitting(false)
            }
        } catch {
            return
        }
    }

    const cancel = () => {
        onCancel()
        form.resetFields()
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
                        <Select allowClear>
                            <Option value="Party / Program Facilitator">Party / Program Facilitator</Option>
                            <Option value="Program Facilitator">Program Facilitator</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.position !== currentValues.position}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('position') === 'other' ? (
                                <Form.Item name="customPosition" label="Custom Position" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                    <Form.Item
                        name="commencementDate"
                        label="Commencement Date"
                        rules={[{ type: 'object' as const, required: true }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="location" label="Studio" rules={[{ required: true }]}>
                        <Select>
                            {Object.values(Location).map((location) => (
                                <Option key={location} value={location}>
                                    {capitalise(location)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="normalRate" label="Monday - Saturday Rate" rules={[{ required: true }]}>
                        <InputNumber precision={2} />
                    </Form.Item>
                    <Form.Item name="sundayRate" label="Sunday Rate" rules={[{ required: true }]}>
                        <InputNumber precision={2} />
                    </Form.Item>
                    <Form.Item label="Manager" rules={[{ required: true }]}>
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
                        extra="Name and position of this is person is included in their welcome email, as well as at the bottom of their contract."
                    >
                        <Form.Item
                            name="senderName"
                            rules={[{ required: true, message: 'Please enter Sender Name' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '8px 0' }}
                        >
                            <Input placeholder="Sender Name" />
                        </Form.Item>
                        <Form.Item
                            name="senderPosition"
                            rules={[{ required: true, message: 'Please enter Sender Position' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '8px' }}
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
