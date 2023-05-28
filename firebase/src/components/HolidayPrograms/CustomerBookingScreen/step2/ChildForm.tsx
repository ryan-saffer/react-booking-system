import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import { SimpleTextRule } from './Step2'
const { TextArea } = Input

type Props = {
    childNumber: number
}

export const ChildForm: React.FC<Props> = ({ childNumber }) => {
    const [hasAllergies, setHasAllergies] = useState(false)

    return (
        <>
            <Form.Item
                name={[childNumber, 'childName']}
                label="Child's name"
                rules={[{ required: true, message: "Please input child's name" }, SimpleTextRule]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[childNumber, 'childAge']}
                label="Child's age"
                rules={[
                    { required: true, message: "Please input child's age" },
                    { pattern: /^(?:[4-9]|1[0-12])$/, message: 'Age must be between 4-12' },
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
                        SimpleTextRule,
                    ]}
                >
                    <TextArea rows={3} />
                </Form.Item>
            )}
        </>
    )
}
