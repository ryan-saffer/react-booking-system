import React, { useState, useContext, useEffect } from 'react'
import './AntD.less'
import Step1 from './step1/Step1'
import { Form, Button, Steps, Row, Modal, Spin, Card, Typography } from 'antd'
import { Acuity } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import Step2 from './step2/Step2'
import Step3 from './step3/Step3'
import { makeStyles } from '@material-ui/core'
import { LeftOutlined } from '@ant-design/icons'
import Root from './Root'
const { Step } = Steps

export type Form = {
    store: string
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    phone: string
    emergencyContact: string
    emergencyPhone: string
    children: {
        childName: string
        childAge: string
        hasAllergies: boolean
        allergies?: string
    }[]
}

const CustomerBookingScreen = () => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [formValues, setFormValues] = useState<Partial<Form>>({})
    const [form] = Form.useForm()

    const styles = useStyles()

    const [loading, setLoading] = useState(true)
    const [noUpcomingPrograms, setNoUpcomingPrograms] = useState(false)
    const [selectedStore, setSelectedStore] = useState('')
    const [classes, setClasses] = useState<Acuity.Class[]>([])
    const [selectedClasses, setSelectedClasses] = useState<Acuity.Class[]>([])
    const [step, setStep] = useState(1)
    const [showNoChildrenModal, setShowNoChildrenModal] = useState(false)

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            callAcuityClientV2(
                'classAvailability',
                firebase
            )({
                appointmentTypeId:
                    process.env.REACT_APP_ENV === 'prod'
                        ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
                        : Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
            })
                .then((result) => {
                    console.log('succeeded')
                    console.log(result.data)
                    setClasses(result.data)
                })
                .catch((err) => {
                    console.log('failed')
                })
                .finally(() => {
                    setLoading(false)
                })
        }

        fetchAvailableSlots()
    }, [])

    useEffect(() => {
        // whenever store selection changes, clear all selected classes
        classes.forEach((klass) => {
            form.resetFields([`${klass.id}-checkbox`])
        })
        setSelectedClasses([])
    }, [selectedStore])

    useEffect(() => {
        if (classes.length === 0) {
            setNoUpcomingPrograms(true)
        } else {
            setNoUpcomingPrograms(false)
        }
    }, [classes])

    const handleClassSelectionChange = (e: CheckboxChangeEvent) => {
        const selectedClass = classes.filter((it) => it.id === e.target.value)[0]
        const classAlreadySelected = selectedClasses.filter((it) => it.id === e.target.value).length === 1
        if (e.target.checked) {
            if (!classAlreadySelected) {
                setSelectedClasses([...selectedClasses, selectedClass])
            }
        } else {
            setSelectedClasses(selectedClasses.filter((it) => it.id !== e.target.value))
        }

        // Clear the list of children, to fix bug where you can add many children,
        // 'go back' and then select a class without enough spots, and continue.
        // Do it here (instead of when the hit the 'go back' button), because if they go back and
        // don't change their selection, no need to clear the children.
        setFormValues({ ...formValues, children: [] })
        form.resetFields(['children'])
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        classes={classes}
                        selectedClasses={selectedClasses}
                        selectedStore={selectedStore}
                        setSelectedStore={setSelectedStore}
                        onClassSelectionChange={handleClassSelectionChange}
                    />
                )
            case 2:
                return <Step2 selectedClasses={selectedClasses} />
            case 3:
                return (
                    <Step3
                        form={formValues as Form}
                        formInstance={form}
                        selectedClasses={selectedClasses}
                        selectedStore={selectedStore}
                    />
                )
        }
    }

    const renderForm = () => {
        if (loading) {
            return <Spin style={{ marginTop: 24, marginBottom: 24 }} />
        }

        if (noUpcomingPrograms) {
            return (
                <Card title="No programs available" style={{ marginBottom: 24 }}>
                    <p>There are no programs available at the moment.</p>
                    <p>Try again a bit later.</p>
                </Card>
            )
        }

        return (
            <Form
                form={form}
                initialValues={{ prefix: '61' }}
                onValuesChange={(_, values) => {
                    // filter out any removed children with undefined values
                    let children = values.children
                    console.log(children)
                    if (children) {
                        values.children = children.filter((child: any) => child && child.childName !== undefined)
                    }
                    setFormValues(values)
                }}
                layout="vertical"
            >
                {renderStep()}
            </Form>
        )
    }

    const renderBackButton = () => {
        if (step > 1) {
            return (
                <Button block type="default" size="large" onClick={() => setStep(step - 1)}>
                    Go back
                </Button>
            )
        }
    }

    const renderForwardButton = () => {
        if (step < 3) {
            return (
                <Button
                    block
                    type="primary"
                    size="large"
                    className={styles.primaryBtn}
                    disabled={selectedClasses.length === 0}
                    onClick={async () => {
                        await form.validateFields()
                        if (step === 2) {
                            // check if any children added
                            // (removing a child makes their values undefined.. so filter those out to be sure)
                            // let children = (formValues as Form).children.filter(child => child.childName !== undefined)

                            // console.log('stepping')
                            if (formValues.children && formValues.children.length !== 0) {
                                setStep(step + 1)
                            } else {
                                setShowNoChildrenModal(true)
                            }
                        } else {
                            setStep(step + 1)
                        }
                    }}
                >
                    Continue
                </Button>
            )
        }
    }

    return (
        <Root>
            <Typography.Title level={4} style={{ margin: 24, textAlign: 'center' }}>
                Holiday Program Booking Form
            </Typography.Title>
            <Steps current={step - 1} style={{ marginBottom: 24 }}>
                <Step title="Select classes" />
                <Step title="Your information" />
                <Step title="Payment" />
            </Steps>
            <div className={styles.wrapper}>
                <div className={styles.form}>
                    {step > 1 && (
                        <Button
                            style={{ width: 'fit-content' }}
                            icon={<LeftOutlined />}
                            onClick={() => setStep(step - 1)}
                        >
                            Go back
                        </Button>
                    )}
                    {renderForm()}
                    <>
                        {renderForwardButton()}
                        {renderBackButton()}
                    </>
                </div>
            </div>
            <Modal
                title="No children added"
                footer={[
                    <Button type="primary" onClick={() => setShowNoChildrenModal(false)}>
                        Ok
                    </Button>,
                ]}
                visible={showNoChildrenModal}
            >
                <p>Please add at least one child to the form.</p>
            </Modal>
        </Root>
    )
}

const useStyles = makeStyles({
    wrapper: {
        width: '100%',
        maxWidth: 500,
        marginBottom: 36,
    },
    form: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    primaryBtn: {
        marginTop: 24,
        marginBottom: 12,
        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        borderColor: 'white',
    },
})
export default CustomerBookingScreen
