import { Form as AntdForm, Button, Card, Modal, Steps, Typography } from 'antd'
import type dayjs from 'dayjs'
import type { AcuityTypes } from 'fizz-kidz'
import { AcuityConstants } from 'fizz-kidz'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { LeftOutlined } from '@ant-design/icons'
import Loader from '@components/Shared/Loader'
import Root from '@components/Shared/Root'
import { useIsMutating } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { trpc } from '@utils/trpc'

import Step1 from '../components/step-1/step-1'
import { Step2 } from '../components/step-2/step-2'
import Step3 from '../components/step-3/step-3'
import { useCart } from '../state/cart-store'

const { Step } = Steps

export type Form = {
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    phone: string
    emergencyContact: string
    emergencyPhone: string
    children: {
        childName: string
        childAge: dayjs.Dayjs
        hasAllergies: boolean
        allergies?: string
        additionalInfo: string
    }[]
    joinMailingList: boolean
    termsAndConditions: boolean
}

export const CustomerBookingPage = () => {
    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('id') || '0') as AcuityConstants.AppointmentTypeValue

    const nowRef = useRef(Date.now())

    const [formValues, setFormValues] = useState<Partial<Form>>({})
    const [form] = AntdForm.useForm()

    const [bookingComplete, setBookingComplete] = useState(false)

    const continueButtonRef = useRef<HTMLButtonElement>(null)

    const selectedClasses = useCart((store) => store.selectedClasses)
    const clearCart = useCart((store) => store.clearCart)
    const toggleClass = useCart((store) => store.toggleClass)
    const selectedStudio = useCart((store) => store.selectedStudio)

    const [step, setStep] = useState(1)
    const [showNoChildrenModal, setShowNoChildrenModal] = useState(false)

    const { data, isLoading, isSuccess, isError } = trpc.acuity.classAvailability.useQuery({
        appointmentTypeIds:
            import.meta.env.VITE_ENV === 'prod'
                ? [appointmentTypeId]
                : [AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM],
        includeUnavailable: true,
        minDate: nowRef.current,
    })

    const isMutating = useIsMutating({
        mutationKey: getQueryKey(trpc.holidayPrograms.bookHolidayProgram),
    })

    useEffect(() => {
        // whenever store selection changes, clear all selected classes
        data?.forEach((klass) => {
            form.resetFields([`${klass.id}-checkbox`])
        })
        clearCart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStudio])

    const handleClassSelectionChange = (klass: AcuityTypes.Client.Class) => {
        toggleClass(klass, formValues?.children?.length || 0)

        // Clear the list of children, to fix bug where you can add many children,
        // 'go back' and then select a class without enough spots, and continue.
        // Do it here (instead of when the hit the 'go back' button), because if they go back and
        // don't change their selection, no need to clear the children.
        setFormValues({ ...formValues, children: [] })
        form.resetFields(['children'])
    }

    function onBookingSuccess() {
        setBookingComplete(true)
    }

    const renderStep = () => {
        if (isSuccess) {
            switch (step) {
                case 1:
                    return (
                        <Step1
                            appointmentTypeId={appointmentTypeId}
                            classes={data}
                            onClassSelectionChange={handleClassSelectionChange}
                        />
                    )
                case 2:
                    return <Step2 form={form} appointmentTypeId={appointmentTypeId} />
                case 3:
                    return (
                        <Step3
                            appointmentTypeId={appointmentTypeId}
                            form={formValues as Form}
                            handleBookingSuccess={onBookingSuccess}
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
                initialValues={{ prefix: '61', joinMailingList: true }}
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
        if (step > 1 && !isMutating && !bookingComplete) {
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
                    className="font-bold shadow-none disabled:text-white"
                    disabled={Object.values(selectedClasses).length === 0}
                    onClick={async () => {
                        setTimeout(() => continueButtonRef.current?.blur())
                        try {
                            await form.validateFields()
                        } catch {
                            return new Error()
                        }
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
        <Root width="centered" useTailwindPreflight={false}>
            <Typography.Title level={4} style={{ margin: 24, marginTop: 0, textAlign: 'center' }}>
                Booking Form
            </Typography.Title>
            <Steps current={step - 1} style={{ marginBottom: 24 }}>
                <Step title="Select classes" />
                <Step title="Your information" />
                <Step title="Payment" />
            </Steps>
            <div style={{ width: '100%', maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    {step > 1 && !isMutating && !bookingComplete && (
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
                    <Button type="primary" key={0} onClick={() => setShowNoChildrenModal(false)}>
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
