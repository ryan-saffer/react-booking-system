import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { makeStyles } from '@material-ui/core'
import { Button, Card, Form, Input, message, Tooltip } from 'antd'
import { ScienceAppointment } from 'fizz-kidz'
import React, { useContext, useState } from 'react'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import useErrorDialog from '../../../Hooks/UseErrorDialog'

const { useForm } = Form

type Props = {
    appointment: ScienceAppointment
}

const PickupPeople: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const [form] = useForm()

    const [changed, setChanged] = useState(false)
    const [loading, setLoading] = useState(false)
    const { ErrorModal, showError } = useErrorDialog()

    const [initialValues, setInitialValues] = useState({
        pickupPeople: appointment.pickupPeople.map((person) => ({ person })),
    })

    const onChange = (values: any) => {
        if (JSON.stringify(values) === JSON.stringify(initialValues)) {
            setChanged(false)
        } else {
            setChanged(true)
        }
    }

    const onFinish = async (values: { pickupPeople: { person: string }[] }) => {
        setLoading(true)
        try {
            const pickupPeople = values.pickupPeople.map((it) => it.person)
            await callFirebaseFunction(
                'updateScienceEnrolment',
                firebase
            )({ appointmentId: appointment.id, pickupPeople })
            message.success({
                content: 'Pickup people updated successfully.',
                className: classes.message,
            })
            setInitialValues({ pickupPeople: pickupPeople.map((person) => ({ person })) })
        } catch (error) {
            showError('There was an issue updating the pickup people. Please try again later, or give us a call.')
            form.setFieldsValue(initialValues)
        }

        setChanged(false)
        setLoading(false)
    }

    const cancel = () => {
        form.setFieldsValue(initialValues)
        setChanged(false)
    }

    return (
        <Card className={classes.card} title="Name and relation to child">
            <Form
                form={form}
                initialValues={initialValues}
                onFinish={onFinish}
                onValuesChange={onChange}
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
                                            { required: true, message: 'Please enter a name and relation to child' },
                                        ]}
                                    >
                                        <Input placeholder="Name and relation to child" size="large" />
                                    </Form.Item>
                                    <Tooltip title="Remove person">
                                        <MinusCircleOutlined
                                            className={classes.removeButton}
                                            onClick={() => remove(name)}
                                        />
                                    </Tooltip>
                                </div>
                            ))}
                            <Form.Item className={classes.addButton}>
                                <Button type="dashed" size="large" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Pickup Person
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.Item>
                    <div className={classes.buttons}>
                        <Button type="primary" htmlType="submit" disabled={!changed} loading={loading}>
                            Save
                        </Button>
                        <Button disabled={!changed} onClick={cancel}>
                            Cancel
                        </Button>
                    </div>
                </Form.Item>
            </Form>
            <ErrorModal />
        </Card>
    )
}

const useStyles = makeStyles({
    card: {
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
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
        right: 22,
        marginTop: 12,
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
})

export default PickupPeople
