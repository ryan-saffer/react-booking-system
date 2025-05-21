import { Button, Divider, Form, Input, Modal, Typography } from 'antd'
import React, { Fragment, useState } from 'react'

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { PhoneRule, SimpleTextRule } from '@utils/formUtils'

import { useCart } from '../../state/cart-store'
import { ChildForm } from './ChildForm'

const { Text } = Typography

type Props = {
    appointmentTypeId: number
}

export const Step2: React.FC<Props> = ({ appointmentTypeId }) => {
    const [showModal, setShowModal] = useState(false)

    const selectedClasses = useCart((store) => store.selectedClasses)
    const calculateTotal = useCart((store) => store.calculateTotal)

    return (
        <>
            <Divider>Parent details</Divider>
            <Form.Item
                label="Parent First Name"
                name="parentFirstName"
                rules={[
                    {
                        required: true,
                        message: 'Please input your first name.',
                    },
                    SimpleTextRule,
                ]}
            >
                <Input autoFocus />
            </Form.Item>
            <Form.Item
                label="Parent Last Name"
                name="parentLastName"
                rules={[{ required: true, message: 'Please input your last name.' }, SimpleTextRule]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Parent Email Address"
                name="parentEmail"
                rules={[
                    {
                        required: true,
                        type: 'email',
                        message: 'Email is not valid',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="phone"
                label="Parent Phone Number"
                rules={[
                    {
                        required: true,
                        message: 'Please input your phone number.',
                    },
                    PhoneRule,
                ]}
            >
                <Input />
            </Form.Item>
            <Divider>Emergency Contact</Divider>
            <Text strong>This person will be contacted in the case we cannot get hold of you</Text>
            <Form.Item
                style={{ marginTop: 12 }}
                label="Emergency contact name"
                name="emergencyContact"
                rules={[
                    {
                        required: true,
                        message: 'Please input the emergency contact.',
                    },
                    SimpleTextRule,
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="emergencyPhone"
                label="Emergency contact phone number"
                rules={[
                    {
                        required: true,
                        message: 'Please input the emergency contact phone number.',
                    },
                    PhoneRule,
                ]}
            >
                <Input />
            </Form.Item>
            <Form.List name="children">
                {(fields, { add, remove }) => {
                    return (
                        <>
                            {fields.map((field, index) => (
                                <Fragment key={field.key}>
                                    <Divider>
                                        Child #{index + 1}
                                        <MinusCircleOutlined
                                            style={{ marginLeft: 12 }}
                                            onClick={() => {
                                                remove(index)
                                                calculateTotal(fields.length - 1)
                                            }}
                                        />
                                    </Divider>
                                    <ChildForm appointmentTypeId={appointmentTypeId} childNumber={index} />
                                </Fragment>
                            ))}
                            <Form.Item key="addChild" style={{ marginBottom: 0 }}>
                                <Button
                                    type="dashed"
                                    size="large"
                                    block
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        // check if there is enough room for an additional child in every class
                                        let canAdd = true
                                        Object.values(selectedClasses).forEach((klass) => {
                                            // +1 for the one we are adding now
                                            if (fields.length + 1 > klass.slotsAvailable) {
                                                setShowModal(true)
                                                canAdd = false
                                            }
                                        })
                                        if (canAdd) {
                                            add()
                                            calculateTotal(fields.length + 1)
                                        }
                                    }}
                                >
                                    Add child
                                </Button>
                            </Form.Item>
                        </>
                    )
                }}
            </Form.List>
            <Modal
                title="Not enough spots"
                open={showModal}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setShowModal(false)}>
                        OK
                    </Button>,
                ]}
            >
                <p>It looks like one of the programs you selected does not have enough spots for another child.</p>
                <p>You can always go back and select a class with more spots.</p>
            </Modal>
        </>
    )
}
