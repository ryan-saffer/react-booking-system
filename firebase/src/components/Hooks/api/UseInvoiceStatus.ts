import { InvoiceStatusMap, ScienceEnrolment } from 'fizz-kidz'
import { Service } from 'fizz-kidz'
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'

import Firebase, { FirebaseContext } from '@components/Firebase'
import { callFirebaseFunction } from '@utils/firebase/functions'

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceId, appointment.invoiceId, appointment.id])

    return [result, setResult]
}

export default useInvoiceStatus
