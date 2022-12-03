import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { Button, Input, Popover, Typography } from 'antd'
import { Acuity } from 'fizz-kidz'
import { callAcuityClient } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { InfoCircleOutlined } from '@ant-design/icons'

const AppointmentTypeId =
    process.env.REACT_APP_ENV === 'prod'
        ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
        : Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM

type Props = {
    email: string
    setDiscount: Dispatch<SetStateAction<Acuity.Certificate | undefined>>
}

const DiscountInput: React.FC<Props> = ({ email, setDiscount }) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validateDiscount = async (value: string) => {
        // do not allow the 'allday' discount code
        if (value === 'allday') {
            setLoading(false)
            setError('The certificate "allday" is invalid')
            return
        }

        setLoading(true)
        setError('')

        try {
            let result = await callAcuityClient(
                'checkCertificate',
                firebase
            )({
                appointmentTypeId: AppointmentTypeId,
                certificate: value,
                email: email,
            })
            setValue('')
            setDiscount(result.data)
        } catch (error: any) {
            if (error.message) {
                setError(error.message)
            } else {
                setError('Invalid discount code')
            }
        }
        setLoading(false)
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <>
                <Input.Search
                    style={{ width: '90%' }}
                    value={value}
                    loading={loading}
                    enterButton="Apply"
                    onChange={(e) => {
                        setValue(e.target.value)
                        setError('')
                    }}
                    onSearch={validateDiscount}
                    placeholder="Apply discount code.."
                    status={error ? 'error' : ''}
                />
                <Popover
                    title="Discounts"
                    content={
                        <>
                            <p>Only one discount can be applied at a time.</p>
                            <p>The 'same day discount' will be overriden by any discount added here.</p>
                        </>
                    }
                >
                    <Button style={{ width: '10%' }} type="link" icon={<InfoCircleOutlined />} />
                </Popover>
            </>
            {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </div>
    )
}

export default DiscountInput
