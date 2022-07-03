import React from 'react'
import { Form, FormListFieldData, Input, Space } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'

type Props = {
    field: FormListFieldData
    remove: (index: number | number[]) => void
}

const ChildForm: React.FC<Props> = ({ field, remove }) => {

    return (
        <Space align='baseline'>
            <Form.Item
                {...field}
                name={[field.name, 'childName']}
                rules={[{ required: true, message: 'Missing child name' }]}
            >
                <Input placeholder="Child name" />
            </Form.Item>
            <MinusCircleOutlined onClick={() => remove(field.name)} />
        </Space>
    )
}

export default ChildForm