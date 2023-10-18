import { Button, DatePicker, Form, Input, Modal, Select, Typography, message } from 'antd'
import React, { useState } from 'react'
import { Dayjs } from 'dayjs'
import { Locations } from 'fizz-kidz'
import useFirebase from '../Hooks/context/UseFirebase'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import { capitalise } from '../../utilities/stringUtilities'

const { Option } = Select

type TNewEmployeeForm = {
    firstName: string
    lastName: string
    mobile: string
    email: string
    position: string
    commencementDate: Dayjs
    location: Exclude<Locations, 'mobile'>
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
    const firebase = useFirebase()
    const [form] = Form.useForm<TNewEmployeeForm>()
    const [messageApi] = message.useMessage()

    const [submitting, setSubmitting] = useState(false)

    const submit = async () => {
        try {
            const values = await form.validateFields()
            const formattedValues = {
                ...values,
                commencementDate: values.commencementDate.format('YYYY-MM-DD'),
            }
            setSubmitting(true)
            try {
                await callFirebaseFunction('initiateOnboarding', firebase)(formattedValues)
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
                        <Input placeholder="Party Facilitator" />
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
                            {Object.values(Locations).map((location) => (
                                <Option key={location} value={location}>
                                    {capitalise(location)}
                                </Option>
                            ))}
                        </Select>
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
                        extra="Name and position of the person listed at the bottom of the contract"
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
