import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import Firebase, { FirebaseContext } from '../../Firebase'

import { InvoiceStatus, ScienceEnrolment } from 'fizz-kidz'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'
import { Service } from 'fizz-kidz'

const useInvoiceStatus = (
    appointment: ScienceEnrolment
): [Service<InvoiceStatus>, Dispatch<SetStateAction<Service<InvoiceStatus>>>] => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [result, setResult] = useState<Service<InvoiceStatus>>({ status: 'loading' })

    const invoiceId = appointment.invoiceId

    useEffect(() => {
        if (invoiceId === '') {
            setResult({ status: 'loaded', result: { status: 'NOT_SENT' } })
            return
        }
        console.log('running retrieveInvoiceStatusV2')
        callFirebaseFunction(
            'retrieveInvoiceStatusV2',
            firebase
        )({ appointmentId: appointment.id })
            .then((result) => {
                setResult({ status: 'loaded', result: result.data })
            })
            .catch((error) => {
                setResult({ status: 'error', error })
            })
    }, [])

    return [result, setResult]
}

export default useInvoiceStatus
