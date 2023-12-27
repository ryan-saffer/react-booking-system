import { Button, Card, Form, Input, Row, Tooltip, Typography, message } from 'antd'
import { AfterSchoolEnrolment } from 'fizz-kidz'
import React, { useState } from 'react'

import { EditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import useErrorDialog from '@components/Hooks/UseErrorDialog'
import useWindowDimensions from '@components/Hooks/UseWindowDimensions'
import useFirebase from '@components/Hooks/context/UseFirebase'
import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import { trpc } from '@utils/trpc'

import styles from './PickupPeople.module.css'

const { useForm } = Form

const BREAKPOINT = 430

type Props = {
    appointment: AfterSchoolEnrolment
}

const PickupPeople: React.FC<Props> = ({ appointment }) => {
    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const [form] = useForm()
    const { width } = useWindowDimensions()

    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const { ErrorModal, showError } = useErrorDialog()

    const [initialValues, setInitialValues] = useState({
        pickupPeople: appointment.pickupPeople.map((person) => ({ person })),
    })

    const updateEnrolmentMutation = trpc.afterSchoolProgram.updateAfterSchoolEnrolment.useMutation()

    const onFinish = async (values: { pickupPeople: { person: string }[] }) => {
        setLoading(true)
        try {
            const pickupPeople = values.pickupPeople.map((it) => it.person)
            await updateEnrolmentMutation.mutateAsync({ id: appointment.id, pickupPeople })
            message.success({
                content: 'Pickup people updated',
                className: styles.message,
            })
            setInitialValues({ pickupPeople: pickupPeople.map((person) => ({ person })) })
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_PICKUP_PEOPLE_UPDATED, {
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.parent.email,
                appointment_id: appointment.id,
            })
        } catch (error) {
            showError({
                message: 'There was an issue updating the pickup people. Please try again later, or give us a call.',
            })
            form.setFieldsValue(initialValues)
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_ERROR_UPDATING_PICKUP_PEOPLE, {
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.parent.email,
                appointment_id: appointment.id,
            })
        }
        setEditing(false)
        setLoading(false)
    }

    const cancel = () => {
        form.setFieldsValue(initialValues)
        setEditing(false)
    }

    return (
        <Row className={styles.row}>
            <Typography.Text style={{ width: 1000 }}>
                Only the people listed here will be allowed to pickup your child from the program.
            </Typography.Text>
            <Typography.Text style={{ width: 1000, margin: '12px 0' }}>
                You do not need to list yourself.
            </Typography.Text>
            <Card
                className={styles.card}
                title="Pickup People"
                extra={
                    !editing && (
                        <>
                            {width > BREAKPOINT ? (
                                <Button type="primary" onClick={() => setEditing(true)}>
                                    Edit
                                </Button>
                            ) : (
                                <Button type="primary" onClick={() => setEditing(true)} icon={<EditOutlined />} />
                            )}
                        </>
                    )
                }
            >
                {initialValues.pickupPeople.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography.Text italic>No pickup people added yet.</Typography.Text>
                    </div>
                )}
                <Form
                    form={form}
                    initialValues={initialValues}
                    style={{ marginTop: 12 }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.List name="pickupPeople">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className={styles.wrapper}>
                                        <Form.Item
                                            className={styles.spacer}
                                            {...restField}
                                            name={[name, 'person']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter a name and relation to child.',
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder="Name and relation to child. Eg: 'John Smith - Grandfather'"
                                                size="large"
                                                disabled={!editing}
                                            />
                                        </Form.Item>
                                        <Tooltip title="Remove person">
                                            <Button
                                                className={styles.removeButton}
                                                disabled={!editing}
                                                type="text"
                                                shape="circle"
                                                icon={<MinusCircleOutlined onClick={() => remove(name)} />}
                                            />
                                        </Tooltip>
                                    </div>
                                ))}

                                <Form.Item className={styles.addButton}>
                                    <Button
                                        disabled={!editing}
                                        type="dashed"
                                        size="large"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Add Pickup Person
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item>
                        <div className={styles.buttons}>
                            <Button type="primary" htmlType="submit" loading={loading} disabled={!editing}>
                                Save
                            </Button>
                            <Button onClick={cancel} disabled={!editing}>
                                Cancel
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
                <ErrorModal />
            </Card>
        </Row>
    )
}

export default PickupPeople
