import React, { useState, useContext, useEffect } from 'react'
import './AntD.less'
import Step1 from './Step1'
import { Form, Button, Steps, Divider, Row, Modal, Spin, Card } from 'antd'
import { Acuity } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import Step2 from './Step2'
import Step3 from './Step3'
import { makeStyles } from '@material-ui/core'
import * as Logo from '../../../drawables/fizz-logo.png'
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

export const PROGRAM_PRICE = 45

const CustomerBookingScreen = () => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [formValues, setFormValues] = useState({})
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
                        : Acuity.Constants.AppointmentTypes
                              .TEST_HOLIDAY_PROGRAM,
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
        console.log(formValues)
    }, [formValues])

    useEffect(() => {
        if (classes.length === 0) {
            setNoUpcomingPrograms(true)
        } else {
            setNoUpcomingPrograms(false)
        }
    }, [classes])

    const handleClassSelectionChange = (e: CheckboxChangeEvent) => {
        const selectedClass = classes.filter(
            (it) => it.id === e.target.value
        )[0]
        const classAlreadySelected =
            selectedClasses.filter((it) => it.id === e.target.value).length ===
            1
        if (e.target.checked) {
            if (!classAlreadySelected) {
                setSelectedClasses([...selectedClasses, selectedClass])
            }
        } else {
            setSelectedClasses(
                selectedClasses.filter((it) => it.id !== e.target.value)
            )
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        classes={classes}
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
            return <Spin style={{ marginBottom: 24 }} />
        }

        if (noUpcomingPrograms) {
            return (
                <Card
                    title="No programs available"
                    style={{ marginBottom: 24 }}
                >
                    <p>There are no programs available at the moment.</p>
                    <p>Try again a bit later.</p>
                </Card>
            )
        }

        return (
            <Form
                form={form}
                initialValues={{ prefix: '61' }}
                onValuesChange={(_, values) => setFormValues(values)}
                layout="vertical"
            >
                {renderStep()}
            </Form>
        )
    }

    const renderBackButton = () => {
        if (step > 1) {
            return (
                <Button
                    block
                    type="default"
                    size="large"
                    onClick={() => setStep(step - 1)}
                >
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
                    style={{ marginBottom: 12 }}
                    disabled={selectedClasses.length === 0}
                    onClick={async () => {
                        await form.validateFields()
                        if (step === 2) {
                            if (form.getFieldsValue()['children']) {
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
        <>
            <div className={styles.logoWrapper}>
                <img className={styles.logo} src={Logo.default} />
            </div>
            <Divider className={styles.divider}>
                Holiday Program Booking Form
            </Divider>
            <Row justify="center">
                <div className={styles.form}>
                    <Steps current={step - 1} style={{ marginBottom: 24 }}>
                        <Step title="Select classes" />
                        <Step title="Your informaton" />
                        <Step title="Payment" />
                    </Steps>
                    {renderForm()}
                    <div>
                        {renderForwardButton()}
                        {renderBackButton()}
                    </div>
                </div>
            </Row>
            <Modal
                title="No children added"
                footer={[
                    <Button
                        type="primary"
                        onClick={() => setShowNoChildrenModal(false)}
                    >
                        Ok
                    </Button>,
                ]}
                visible={showNoChildrenModal}
            >
                <p>Please add at least one child to the form.</p>
            </Modal>
        </>
    )
}

const useStyles = makeStyles({
    logoWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        marginTop: 10,
        maxWidth: 200,
    },
    divider: {
        fontSize: '24px !important',
        fontWeight: 300,
        marginTop: '24px !important',
        marginBottom: '24px !important',
    },
    form: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '80%',
        maxWidth: 500,
        marginBottom: 36,
    },
})
export default CustomerBookingScreen
