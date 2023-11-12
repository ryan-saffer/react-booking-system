import { AcuityTypes } from 'fizz-kidz'
import React, { Fragment, useEffect, useState } from 'react'
import { Button, Checkbox, Divider, Form as AntdForm, Input, Modal, Select, Typography } from 'antd'
import { PhoneRule, SimpleTextRule } from '@utils/formUtils'
import Upload from './Upload'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import TermsAndConditions from './TermsAndConditions'
import { FormSubmission } from '.'

const { Text } = Typography
const { Option } = Select
const { TextArea } = Input

type Props = {
    appointmentType: AcuityTypes.Api.AppointmentType
    onSubmit: FormSubmission
}

const Form: React.FC<Props> = ({ appointmentType, onSubmit }) => {
    const [form] = AntdForm.useForm()

    const [loading, setLoading] = useState(false)
    const [hasAllergies, setHasAllergies] = useState(false)
    const [isAnaphylactic, setIsAnaphylactic] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handleSubmit = async () => {
        try {
            await form.validateFields()
        } catch (err) {
            return
        }
        setLoading(true)
        onSubmit({
            appointmentTypeId: appointmentType.id,
            calendarId: appointmentType.calendarIDs[0],
            parent: {
                firstName: form.getFieldValue('parentFirstName'),
                lastName: form.getFieldValue('parentLastName'),
                phone: form.getFieldValue('parentPhone'),
                email: form.getFieldValue('parentEmail'),
            },
            child: {
                firstName: form.getFieldValue('childFirstName'),
                lastName: form.getFieldValue('childLastName'),
                age: form.getFieldValue('childAge'),
                grade: form.getFieldValue('childGrade'),
                allergies: form.getFieldValue('childAllergies') ?? '',
                isAnaphylactic: isAnaphylactic,
                anaphylaxisPlan: form.getFieldValue('anaphylaxisPlan') ?? '',
                permissionToPhotograph: form.getFieldValue('permissionToPhotograph') === 'yes',
            },
            emergencyContact: {
                name: form.getFieldValue('emergencyContactName'),
                relation: form.getFieldValue('emergencyContactRelation'),
                phone: form.getFieldValue('emergencyContactNumber'),
            },
            className: appointmentType.name,
            pickupPeople: form.getFieldValue('pickupPeople')
                ? form.getFieldValue('pickupPeople').map((person: any) => person.pickupPerson)
                : [],
        })
    }

    return (
        <>
            <AntdForm style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }} layout="vertical" form={form}>
                <Divider>Parent Details</Divider>
                <AntdForm.Item
                    label="Parent First Name"
                    name="parentFirstName"
                    rules={[{ required: true, message: 'Please enter your first name' }, SimpleTextRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Parent Last Name"
                    name="parentLastName"
                    rules={[{ required: true, message: 'Please enter your last name' }, SimpleTextRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Parent Email Address"
                    name="parentEmail"
                    rules={[{ required: true, type: 'email', message: 'Email address is not valid' }]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Parent Phone Number"
                    name="parentPhone"
                    rules={[{ required: true, message: 'Please enter your phone number' }, PhoneRule]}
                >
                    <Input />
                </AntdForm.Item>

                <Divider>Child Details</Divider>
                <AntdForm.Item
                    label="Child First Name"
                    name="childFirstName"
                    rules={[{ required: true, message: 'Please enter the childs first name' }, SimpleTextRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Child Last Name"
                    name="childLastName"
                    rules={[{ required: true, message: 'Please enter the childs last name' }, SimpleTextRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Child Age"
                    name="childAge"
                    rules={[{ required: true, message: 'Please enter the childs age' }, PhoneRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Child Year Level"
                    name="childGrade"
                    rules={[{ required: true, message: "Please select the child's year level" }]}
                >
                    <Select allowClear>
                        <Option value="Prep">Prep</Option>
                        <Option value="Grade 1">Grade 1</Option>
                        <Option value="Grade 2">Grade 2</Option>
                        <Option value="Grade 3">Grade 3</Option>
                        <Option value="Grade 4">Grade 4</Option>
                        <Option value="Grade 5">Grade 5</Option>
                        <Option value="Grade 6">Grade 6</Option>"
                    </Select>
                </AntdForm.Item>
                <AntdForm.Item
                    name="childHasAllergies"
                    label="Does your child have any allergies?"
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
                </AntdForm.Item>
                {hasAllergies && (
                    <AntdForm.Item
                        name="childAllergies"
                        label="Please enter the allergies here"
                        rules={[
                            {
                                required: true,
                                message: "Please input child's allergies",
                            },
                        ]}
                    >
                        <TextArea rows={3} />
                    </AntdForm.Item>
                )}
                {hasAllergies && (
                    <AntdForm.Item
                        name="childIsAnaphylactic"
                        label="Is your child anaphylactic?"
                        rules={[
                            {
                                required: true,
                                message: 'Please input if the child is anaphylactic',
                            },
                        ]}
                    >
                        <Select onChange={(value) => setIsAnaphylactic(value === 'yes')}>
                            <Select.Option value="yes">Yes</Select.Option>
                            <Select.Option value="no">No</Select.Option>
                        </Select>
                    </AntdForm.Item>
                )}
                {isAnaphylactic && (
                    <AntdForm.Item
                        name="anaphylaxisPlan"
                        label="Please upload your childs anaphylaxis plan."
                        rules={[
                            {
                                required: true,
                                message:
                                    'An anaphylaxis plan is required for all children with anaphylactic allergies.',
                            },
                        ]}
                    >
                        <Upload onSuccess={(filepath: string) => form.setFieldsValue({ anaphylaxisPlan: filepath })} />
                    </AntdForm.Item>
                )}

                <AntdForm.Item
                    name="permissionToPhotograph"
                    label="We love to show other parents the cool things that we do by taking pictures and videos. Do you give permission for your child to be in our marketing content? "
                    rules={[
                        {
                            required: true,
                            message: 'Please answer this question',
                        },
                    ]}
                >
                    <Select>
                        <Select.Option value="yes">Yes - I give permission</Select.Option>
                        <Select.Option value="no">No - I don't give permission</Select.Option>
                    </Select>
                </AntdForm.Item>

                <Divider>Emergency Contact</Divider>
                <Text strong>This person will be contacted in the case we cannot get hold of you.</Text>
                <AntdForm.Item
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    rules={[{ required: true, message: 'Please enter the emergency contact name' }, SimpleTextRule]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Emergency Contact Relation"
                    name="emergencyContactRelation"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter the emergency contacts relation to the child. Eg. "Aunty"',
                        },
                        SimpleTextRule,
                    ]}
                >
                    <Input />
                </AntdForm.Item>
                <AntdForm.Item
                    label="Emergency Contact Number"
                    name="emergencyContactNumber"
                    rules={[{ required: true, message: 'Please enter the emergency contact phone number' }, PhoneRule]}
                >
                    <Input />
                </AntdForm.Item>

                <Divider>Pickup People</Divider>
                <p>Please list here anyone who you give permission to pickup your child from Science Club.</p>
                <p>You do not need to list yourself.</p>
                <p>Example: 'Harry - Dad'</p>
                <AntdForm.List name="pickupPeople">
                    {(fields, { add, remove }) => {
                        return (
                            <>
                                {fields.map((field, index) => (
                                    <Fragment key={field.key}>
                                        <Divider>
                                            Pickup Person #{index + 1}
                                            <MinusCircleOutlined
                                                style={{ marginLeft: 12 }}
                                                onClick={() => remove(index)}
                                            />
                                        </Divider>
                                        <AntdForm.Item
                                            name={[index, 'pickupPerson']}
                                            label="Name and relation to child"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please input pickup persons name and relation to child',
                                                },
                                                SimpleTextRule,
                                            ]}
                                        >
                                            <Input />
                                        </AntdForm.Item>
                                    </Fragment>
                                ))}
                                <AntdForm.Item key="addPickupPerson" style={{ marginBottom: 0 }}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<PlusOutlined />}
                                        onClick={() => add()}
                                    >
                                        Add pickup person
                                    </Button>
                                </AntdForm.Item>
                            </>
                        )
                    }}
                </AntdForm.List>

                <AntdForm.Item
                    style={{ marginTop: 20 }}
                    name="termsAndConditions"
                    valuePropName="checked"
                    rules={[
                        {
                            required: true,
                            transform: (value) => value || undefined, // Those two lines
                            type: 'boolean',
                            message: 'Please accept the terms and conditions',
                        },
                    ]}
                >
                    <Checkbox>
                        I have read and agreed to the{' '}
                        <Typography.Link
                            onClick={(e) => {
                                e.preventDefault()
                                setShowTermsModal(true)
                            }}
                        >
                            Terms and Conditions
                        </Typography.Link>
                    </Checkbox>
                </AntdForm.Item>
            </AntdForm>
            <Modal
                title="Terms and conditions"
                style={{ top: 20 }}
                bodyStyle={{ top: 20, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
                open={showTermsModal}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setShowTermsModal(false)}>
                        OK
                    </Button>,
                ]}
                onCancel={() => setShowTermsModal(false)}
            >
                <TermsAndConditions />
            </Modal>
            <Button
                style={{
                    marginBottom: 12,
                    background: 'linear-gradient(270deg, #2FEAA8, #028CF3)',
                    borderColor: 'white',
                }}
                block
                loading={loading}
                type="primary"
                size="large"
                onClick={handleSubmit}
            >
                Enrol
            </Button>
        </>
    )
}

export default Form
