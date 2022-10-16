import React, { useState } from 'react'
import { EditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { makeStyles, Theme } from '@material-ui/core'
import { Button, Card, Form, Input, message, Row, Tooltip, Typography } from 'antd'
import { ScienceEnrolment } from 'fizz-kidz'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'
import useMixpanel from '../../../Hooks/context/UseMixpanel'
import useErrorDialog from '../../../Hooks/UseErrorDialog'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { MixpanelEvents } from '../../../Mixpanel/Events'
const { useForm } = Form

const BREAKPOINT = 430

type Props = {
    appointment: ScienceEnrolment
}

type ThemeProps = {
    width: number
}

const PickupPeople: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles({ width: BREAKPOINT })

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

    const onFinish = async (values: { pickupPeople: { person: string }[] }) => {
        setLoading(true)
        try {
            const pickupPeople = values.pickupPeople.map((it) => it.person)
            await callFirebaseFunction('updateScienceEnrolment', firebase)({ id: appointment.id, pickupPeople })
            message.success({
                content: 'Pickup people updated',
                className: classes.message,
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
        <Row className={classes.row}>
            <Card
                className={classes.card}
                title="Name and relation to child"
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography.Text strong>You do not need to list yourself here</Typography.Text>
                    <Typography.Text italic style={{ marginTop: 12 }}>
                        Example: "John Smith - Grandfather"
                    </Typography.Text>
                </div>
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
                                    <div key={key} className={classes.wrapper}>
                                        <Form.Item
                                            className={classes.spacer}
                                            {...restField}
                                            name={[name, 'person']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter a name and relation to child',
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder="Name and relation to child"
                                                size="large"
                                                disabled={!editing}
                                            />
                                        </Form.Item>
                                        <Tooltip title="Remove person">
                                            <Button
                                                className={classes.removeButton}
                                                disabled={!editing}
                                                type="text"
                                                shape="circle"
                                                icon={<MinusCircleOutlined onClick={() => remove(name)} />}
                                            />
                                        </Tooltip>
                                    </div>
                                ))}

                                <Form.Item className={classes.addButton}>
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
                        <div className={classes.buttons}>
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

const useStyles = makeStyles<Theme, ThemeProps>(() => ({
    row: {
        justifyContent: 'center',
    },
    card: (props) => ({
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
        '& .ant-card-head': {
            [`@media(max-width: ${props.width}px)`]: {
                fontSize: 15,
            },
        },
        width: 1000,
    }),
    spacer: {
        flex: 1,
        marginBottom: 0,
        paddingRight: 32,
    },
    wrapper: {
        display: 'flex',
        marginBottom: 18,
    },
    removeButton: {
        position: 'absolute',
        right: 15,
        marginTop: 3,
    },
    addButton: {
        paddingRight: 32,
    },
    buttons: {
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'end',
        gap: 16,
    },
    message: {
        marginTop: '85vh',
    },
}))

export default PickupPeople
