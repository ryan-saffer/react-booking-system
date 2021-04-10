import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import Firebase, { FirebaseContext } from '../Firebase'

import { Acuity, InvoiceStatus, RetrieveInvoiceStatusResult } from 'fizz-kidz'
import { FunctionsResult } from '../../utilities/firebase/functions'


const useInvoiceStatus = (appointment: Acuity.Appointment): [RetrieveInvoiceStatusResult, Dispatch<SetStateAction<RetrieveInvoiceStatusResult>>] => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [result, setResult] = useState<RetrieveInvoiceStatusResult>({ status: InvoiceStatus.LOADING })

    useEffect(() => {
        console.log('running retrieveInvoiceStatus')
        firebase.functions.httpsCallable('retrieveInvoiceStatus')({
            appointmentId: appointment.id
        })
        .then((result: FunctionsResult<RetrieveInvoiceStatusResult>) => {
            setResult(result.data)
        })
        .catch(err => {
            console.error(
                'error running :retrieveInvoiceStatus:',
                '--statusCode:', err.code,
                '--message:', err.message,
                '--details:', err.details
            )
            setResult({ status: InvoiceStatus.ERROR })
        })
    }, [])

    return [result, setResult]
}

export default useInvoiceStatus