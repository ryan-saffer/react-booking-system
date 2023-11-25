import { Form as AntdForm, Button, Card, Modal, Steps, Typography } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { AcuityConstants, AcuityTypes } from 'fizz-kidz'
import { useEffect, useRef, useState } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import Loader from '@components/ScienceClub/shared/Loader'
import Root from '@components/Shared/Root'
import { trpc } from '@utils/trpc'

import Step1 from './step1/Step1'
import { Step2 } from './step2/Step2'
import Step3 from './step3/Step3'

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

export const CustomerBookingScreen = () => {
    const nowRef = useRef(Date.now())

    const [formValues, setFormValues] = useState<Partial<Form>>({})
    const [form] = AntdForm.useForm()

    const continueButtonRef = useRef<HTMLButtonElement>(null)

    const [selectedStore, setSelectedStore] = useState('')
    const [selectedClasses, setSelectedClasses] = useState<AcuityTypes.Api.Class[]>([])
    const [step, setStep] = useState(1)
    const [showNoChildrenModal, setShowNoChildrenModal] = useState(false)

    const { data, isLoading, isSuccess, isError } = trpc.acuity.classAvailability.useQuery({
        appointmentTypeId:
            import.meta.env.VITE_ENV === 'prod'
                ? AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM
                : AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
        includeUnavailable: true,
        minDate: nowRef.current,
    })

    useEffect(() => {
        // whenever store selection changes, clear all selected classes
        data?.forEach((klass) => {
            form.resetFields([`${klass.id}-checkbox`])
        })
        setSelectedClasses([])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStore])

    const handleClassSelectionChange = (e: CheckboxChangeEvent) => {
        if (isSuccess) {
            const selectedClass = data?.filter((it) => it.id === e.target.value)[0]
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
    }

    const renderStep = () => {
        if (isSuccess) {
            switch (step) {
                case 1:
                    return (
                        <Step1
                            classes={data}
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
                            selectedClasses={selectedClasses}
                            selectedStore={selectedStore}
                        />
                    )
            }
        }
    }

    const renderForm = () => {
        if (isLoading) {
            return <Loader style={{ marginTop: 24, marginBottom: 24 }} />
        }

        if (data?.length === 0 || isError) {
            return (
                <Card title="No programs available" style={{ marginBottom: 24 }}>
                    <p>There are no programs available at the moment.</p>
                    <p>Try again a bit later.</p>
                </Card>
            )
        }

        return (
            <AntdForm
                form={form}
                initialValues={{ prefix: '61' }}
                onValuesChange={(_, values) => {
                    // filter out any removed children with undefined values
                    const children = values.children
                    if (children) {
                        values.children = children.filter((child: any) => child && child.childName !== undefined)
                    }
                    setFormValues(values)
                }}
                layout="vertical"
            >
                {renderStep()}
            </AntdForm>
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
                    ref={continueButtonRef}
                    block
                    type="primary"
                    size="large"
                    style={{
                        marginTop: 24,
                        marginBottom: 12,
                        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
                        borderColor: 'white',
                    }}
                    disabled={selectedClasses.length === 0}
                    onClick={async () => {
                        setTimeout(() => continueButtonRef.current?.blur())
                        await form.validateFields()
                        if (step === 2) {
                            // check if any children added
                            // (removing a child makes their values undefined.. so filter those out to be sure)
                            // let children = (formValues as Form).children.filter(child => child.childName !== undefined)

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
        <Root color="pink" width="centered">
            <Typography.Title level={4} style={{ margin: 24, textAlign: 'center' }}>
                Holiday Program Booking Form
            </Typography.Title>
            <Steps current={step - 1} style={{ marginBottom: 24 }}>
                <Step title="Select classes" />
                <Step title="Your information" />
                <Step title="Payment" />
            </Steps>
            <div style={{ width: '100%', maxWidth: 500, marginBottom: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
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
                        OK
                    </Button>,
                ]}
                open={showNoChildrenModal}
            >
                <p>Please add at least one child to the form.</p>
            </Modal>
        </Root>
    )
}
