import React, { useState } from 'react'
import { Form, Checkbox, Input, Select } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
const { Option } = Select
const { TextArea } = Input

type Props = {
    childNumber: number
}

const ChildForm: React.FC<Props> = ({ childNumber }) => {
    const [hasAllergies, setHasAllergies] = useState(false)

    return (
        <>
            <Form.Item
                name={[childNumber, 'childName']}
                label="Child's name"
                rules={[
                    { required: true, message: "Please input child's name" },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[childNumber, 'childAge']}
                label="Child's age"
                rules={[
                    { required: true, message: "Please input child's age" },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[childNumber, 'hasAllergies']}
                label="Does this child have any allergies?"
                rules={[
                    {
                        required: true,
                        message: 'Please input if the child has any allergies',
                    },
                ]}
            >
                <Select onChange={(value) => setHasAllergies(value === 'yes')}>
                    <Select.Option value="yes">Yes</Select.Option>
                    <Select.Option value="no">No</Select.Option>
                </Select>
            </Form.Item>
            {hasAllergies && (
                <Form.Item
                    name={[childNumber, 'allergies']}
                    label="Please enter the allergies here"
                    rules={[
                        {
                            required: true,
                            message: "Please input child's allergies",
                        },
                    ]}
                >
                    <TextArea rows={3} />
                </Form.Item>
            )}
        </>
    )
}

export default ChildForm
