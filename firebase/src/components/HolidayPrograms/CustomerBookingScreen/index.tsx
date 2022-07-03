import React, { useState, useContext, useEffect } from 'react'
import './AntD.css'
import Step1 from './Step1'
import { Form, Button, Steps } from 'antd'
import { Acuity } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import Step2 from './Step2'
import Step3 from './Step3'
const { Step } = Steps


const CustomerBookingScreen = () => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [form] = Form.useForm()

    const [loading, setLoading] = useState(true)
    const [selectedStore, setSelectedStore] = useState('')
    const [classes, setClasses] = useState<Acuity.Class[]>([])
    const [selectedClasses, setSelectedClasses] = useState<number[]>([])
    const [step, setStep] = useState(1)

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            callAcuityClientV2('classAvailability', firebase)({
                appointmentTypeId: Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
            }).then(result => {
                console.log('succeeded')
                console.log(result.data)
                setClasses(result.data)
            }).catch(err => {
                console.log('failed')
            }).finally(() => {
                setLoading(false)
            })
        }

        fetchAvailableSlots()
    }, [])

    useEffect(() => {
        console.log(selectedClasses)
    }, [selectedClasses])

    const handleClassSelectionChange = (e: CheckboxChangeEvent) => {
        console.log(e.target.value)
        if (e.target.checked) {
            if (selectedClasses.indexOf(e.target.value) === -1) {
                setSelectedClasses([...selectedClasses, e.target.value])
            }
        } else {
            setSelectedClasses(selectedClasses.filter(it => it !== e.target.value))
        }
    }

    const renderStep = () => {
        switch(step) {
            case 1:
                return <Step1
                    form={form}
                    classes={classes}
                    selectedStore={selectedStore}
                    setSelectedStore={setSelectedStore}
                    onClassSelectionChange={handleClassSelectionChange}
                />
            case 2:
                return <Step2 />
            case 3:
                return <Step3 form={form}/>
        }
    }

    const renderForm = () => {
        if (loading) {
            return <div>Loading...</div>
        }

        return (
            <Form form={form} initialValues={{ prefix: '61' }}>
                {renderStep()}
            </Form>
        )
    }

    const renderBackButton = () => {
        if (step > 1) {
            return <Button onClick={() => setStep(step - 1)}>Go back</Button>
        }
    }

    const renderForwardButton = () => {
        if (step < 3) {
            return <Button
                disabled={selectedClasses.length === 0}
                onClick={async () => {
                    await form.validateFields()
                    setStep(step + 1)
                }}
            >Continue</Button>
        }
    }

    return (
        <>
            <Steps current={step - 1}>
                <Step title="Select classes" description="Description" />
                <Step title="Your informaton" description="Description" />
                <Step title="Payment" description="Description" />
            </Steps>
            {renderForm()}
            <div>
                {renderBackButton()}
                {renderForwardButton()}
            </div>
        </>
    )
}
export default CustomerBookingScreen