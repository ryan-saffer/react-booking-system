import React, { useContext, useState } from 'react'
import { Input, Typography } from 'antd'
import { Acuity } from 'fizz-kidz'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'

const AppointmentTypeId =
    process.env.REACT_APP_ENV === 'prod'
        ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
        : Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM

type Props = {
    email: string
}

const DiscountInput: React.FC<Props> = ({ email }) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validateDiscount = async (value: string) => {
        console.log(value)

        // do not allow the 'allday' discount code
        if (value === 'allday') {
            setLoading(false)
            setError('The certificate "allday" is invalid')
            return
        }

        setLoading(true)
        setError('')
        // setTimeout(() => {
        //     setLoading(false)
        //     setError(true)
        // }, 2000)

        try {
            let result = await callAcuityClientV2(
                'checkCertificate',
                firebase
            )({
                appointmentTypeId: AppointmentTypeId,
                certificate: value,
                email: email,
            })
            if (result.data.discountType === 'price') {
                console.log('price discount of', result.data.discountAmount)
            } else if (result.data.discountType === 'percentage') {
                console.log('percentage discount of', result.data.discountAmount)
            }
        } catch(error: any) {
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
            <Input.Search
                loading={loading}
                onSearch={validateDiscount}
                placeholder="Enter discount code"
                enterButton="Apply discount code"
                status={error ? 'error' : ''}
            />
            {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </div>
    )
}

export default DiscountInput
