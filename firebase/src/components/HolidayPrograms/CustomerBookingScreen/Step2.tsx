import React from 'react'
import { Form, Input, Select, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import ChildForm from './ChildForm';
const { Option } = Select

type Props = {

}

const Step2: React.FC<Props> = () => {

    const prefixSelector = (
        <Form.Item name="prefix" noStyle>
            <Select style={{ width: 70 }}>
                <Option value="61">+61</Option>
            </Select>
        </Form.Item>
    )

    return (
        <>
            <Form.Item
                label="Parent First Name"
                name="parentFirstName"
                rules={[{ required: true, message: 'Please input your first name.' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Parent Last Name"
                name="parentLastName"
                rules={[{ required: true, message: 'Please input your last name.' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Parent Email Address"
                name="parentEmail"
                rules={[{ required: true, type: 'email', message: 'Email is not valid' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="phone"
                label="Parent Phone Number"
                rules={[{ required: true, message: 'Please input your phone number.' }]}
            >
                <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
            </Form.Item>
            <Form.List name="children">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(field => (
                            <ChildForm key={field.key} field={field} remove={remove} />
                        ))}
                        <Form.Item>
                            <Button type="dashed" size="large" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add child
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </>
    )
}

export default Step2