import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select, Typography, message } from 'antd'
import type { Dayjs } from 'dayjs'
import type { Studio } from 'fizz-kidz'
import { STUDIOS } from 'fizz-kidz'
import React, { useState } from 'react'

import { useOrg } from '@components/Session/use-org'
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
    location: Studio
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

    const { currentOrg } = useOrg()

    const [submitting, setSubmitting] = useState(false)

    const initiateOnboardingMutation = trpc.staff.initiateOnboarding.useMutation()

    const submit = async () => {
        try {
            const values = await form.validateFields()
            const formattedValues = {
                ...values,
                studio: currentOrg!,
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
                <Typography.Title level={4}>Onboard New Employee</Typography.Title>
                <Divider />
                <Form form={form} layout="vertical" size="middle">
                    <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter First Name' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter Last Name' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                    >
                        <Input />
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
                            {STUDIOS.map((studio) => (
                                <Option key={studio} value={studio}>
                                    {capitalise(studio)}
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
                    <Form.Item
                        name="managerName"
                        label="Manager Name"
                        rules={[{ required: true, message: 'Please enter Manager Name' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: 0 }}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="managerPosition"
                        label="Manager Position"
                        rules={[{ required: true, message: 'Please enter Manager Position' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="senderName"
                        label="Sender Name"
                        rules={[{ required: true, message: 'Please enter Sender Name' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '8px 0' }}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="senderPosition"
                        label="Sender Position"
                        rules={[{ required: true, message: 'Please enter Sender Position' }]}
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '8px' }}
                    >
                        <Input />
                    </Form.Item>
                    <Typography.Text type="secondary">
                        Name and position of this is person is included in their welcome email, as well as at the bottom
                        of their contract.
                    </Typography.Text>
                </Form>
            </div>
        </Modal>
    )
}

export default NewEmployeeForm
