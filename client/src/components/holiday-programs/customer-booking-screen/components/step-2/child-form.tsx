import { DatePicker, Form, Input, Select } from 'antd'
import dayjs from 'dayjs'
import { AcuityConstants } from 'fizz-kidz'
import React, { useState } from 'react'

import { SimpleTextRule } from '@utils/formUtils'
import { useCart } from '../../state/cart-store'

const { TextArea } = Input

type Props = {
    appointmentTypeId: number
    childNumber: number
}

export const ChildForm: React.FC<Props> = ({ appointmentTypeId, childNumber }) => {
    const getEarliestClass = useCart((cart) => cart.getEarliestClass)
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
                label="Child's date of birth"
                extra={
                    appointmentTypeId !== AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING &&
                    'The minimum age is 4 years old, and all children must be completely toilet trained 😊'
                }
                rules={[
                    {
                        type: 'object' as const,
                        required: true,
                        validator: (_, value: dayjs.Dayjs) => {
                            if (!value) return Promise.reject(new Error("Please input child's age"))

                            if (appointmentTypeId === AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING) {
                                // remove age limit on kingsville since 18+ months is allowed.
                                return Promise.resolve()
                            }

                            const earliestClass = getEarliestClass()
                            const fourYearsAgo = dayjs(earliestClass).subtract(4, 'years').add(1, 'days')
                            const thirteenYearsAgo = dayjs(earliestClass).subtract(13, 'years').add(1, 'days')

                            if (value.isAfter(fourYearsAgo)) {
                                // younger than 4
                                return Promise.reject(new Error('Child must be at least 4 years old.'))
                            } else if (value.isBefore(thirteenYearsAgo)) {
                                // 13 or older
                                return Promise.reject(new Error('Child must be 12 years old or younger.'))
                            } else {
                                // between 4 and 12
                                return Promise.resolve()
                            }
                        },
                    },
                ]}
            >
                <DatePicker format="DD/MM/YYYY" />
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
            <Form.Item
                name={[childNumber, 'additionalInfo']}
                label="Is there additional information you would like us to know about this child?"
            >
                <TextArea rows={3} />
            </Form.Item>
        </>
    )
}
