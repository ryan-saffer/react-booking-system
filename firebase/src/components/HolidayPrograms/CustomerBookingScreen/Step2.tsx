import React, { Fragment, useState } from 'react'
import { Form, Input, Select, Button, Divider, Modal, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ChildForm from './ChildForm'
import { Acuity } from 'fizz-kidz'
const { Option } = Select
const { Text } = Typography

type Props = {
    selectedClasses: Acuity.Class[]
}

const Step2: React.FC<Props> = ({ selectedClasses }) => {
    const [showModal, setShowModal] = useState(false)

    const prefixSelector = (
        <Form.Item name="prefix" noStyle>
            <Select style={{ width: 70 }}>
                <Option value="61">+61</Option>
            </Select>
        </Form.Item>
    )

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
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Parent Last Name"
                name="parentLastName"
                rules={[
                    { required: true, message: 'Please input your last name.' },
                ]}
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
                ]}
            >
                <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
            </Form.Item>
            <Divider>Emergency Contact</Divider>
            <Text strong>
                This person will be contacted in the case we cannot get hold of
                you
            </Text>
            <Form.Item
                style={{ marginTop: 12 }}
                label="Emergency contact name"
                name="emergencyContact"
                rules={[
                    {
                        required: true,
                        message: 'Please input the emergency contact.',
                    },
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
                        message:
                            'Please input the emergency contact phone number.',
                    },
                ]}
            >
                <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
            </Form.Item>
            <Form.List name="children">
                {(fields, { add, remove }) => (
                    <>
                        {/* first child required, only additional added below */}
                        <Divider>Child #1</Divider>
                        <ChildForm childNumber={1} remove={remove} />
                        {fields.map((field) => (
                            <Fragment key={field.key}>
                                <Divider>Child #{field.name + 2}</Divider>
                                <ChildForm
                                    childNumber={field.name + 2}
                                    remove={remove}
                                />
                            </Fragment>
                        ))}
                        <Form.Item key="addChild">
                            <Button
                                type="dashed"
                                size="large"
                                onClick={() => {
                                    // check if there is enough room for an additional child in every class
                                    let canAdd = true
                                    selectedClasses.forEach((klass) => {
                                        // +2 because one for the first child above, and one for the one we are adding now
                                        if (
                                            fields.length + 2 >
                                            klass.slotsAvailable
                                        ) {
                                            setShowModal(true)
                                            canAdd = false
                                        }
                                    })
                                    if (canAdd) {
                                        add()
                                    }
                                }}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add child
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Modal
                title="Not enough room"
                visible={showModal}
                footer={[
                    <Button
                        key="ok"
                        type="primary"
                        onClick={() => setShowModal(false)}
                    >
                        Ok
                    </Button>,
                ]}
            >
                <p>
                    It looks like one of the programs you selected does not have
                    enough spots for another child.
                </p>
                <p>
                    You can always go back and select a class with more spots.
                </p>
            </Modal>
        </>
    )
}

export default Step2
