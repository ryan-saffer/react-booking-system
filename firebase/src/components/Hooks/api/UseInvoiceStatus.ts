import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import Firebase, { FirebaseContext } from '../../Firebase'

import { InvoiceStatus, InvoiceStatusMap, ScienceEnrolment } from 'fizz-kidz'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'
import { Service } from 'fizz-kidz'

const useInvoiceStatus = (
    appointment: ScienceEnrolment
): [Service<InvoiceStatusMap>, Dispatch<SetStateAction<Service<InvoiceStatusMap>>>] => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [result, setResult] = useState<Service<InvoiceStatusMap>>({ status: 'loading' })

    const invoiceId = appointment.invoiceId

    useEffect(() => {
        if (invoiceId === '') {
            setResult({ status: 'loaded', result: { [appointment.id]: { status: 'NOT_SENT' } } })
            return
        }
        console.log('running retrieveInvoiceStatuses')
        callFirebaseFunction(
            'retrieveInvoiceStatuses',
            firebase
        )({ appointmentIds: [appointment.id] })
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
