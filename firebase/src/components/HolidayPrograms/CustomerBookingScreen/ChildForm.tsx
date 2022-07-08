import React, { useState } from 'react'
import { Form, Checkbox, Input } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
const { TextArea } = Input

type Props = {
    childNumber: number
    remove: (index: number | number[]) => void
}

const ChildForm: React.FC<Props> = ({ childNumber, remove }) => {

    const [hasAllergies, setHasAllergies] = useState(false)

    return (
        // <Space align='baseline' style={{ width: '100%'}}>
        <>
            <Form.Item
                name={[childNumber, 'childName']}
                label="Child's name"
                rules={[{ required: true, message: "Please input child's name" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[childNumber, 'childAge']}
                label="Child's age"
                rules={[{ required: true, message: "Please input child's age" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[childNumber, 'hasAllergies']}
                valuePropName="checked"
            >
                <Checkbox onChange={e => setHasAllergies(e.target.checked)}>This child has allergies</Checkbox>
            </Form.Item>
            {hasAllergies && <Form.Item
                    name={[childNumber, 'allergies']}
                    label="Please enter the allergies here"
                    rules={[{ required: true, message: "Please input child's allergies" }]}
                >
                    <TextArea rows={3} />
                </Form.Item>
            }
            {/* <MinusCircleOutlined onClick={() => remove(childNumber)} /> */}
        {/* </Space> */}
        </>
    )
}

export default ChildForm