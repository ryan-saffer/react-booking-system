import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import Firebase, { FirebaseContext } from '../Firebase'

import { Acuity, InvoiceStatus, InvoiceStatusWithUrl } from 'fizz-kidz'
import { callFirebaseFunction } from '../../utilities/firebase/functions'
import { Types } from 'fizz-kidz'


const useInvoiceStatus = (appointment: Acuity.Appointment): [Types.Functions.Service<InvoiceStatusWithUrl>, Dispatch<SetStateAction<Types.Functions.Service<InvoiceStatusWithUrl>>>] => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [result, setResult] = useState<Types.Functions.Service<InvoiceStatusWithUrl>>({ status: 'loading' })

    const invoiceId = Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.INVOICE, Acuity.Constants.FormFields.INVOICE_ID)

    useEffect(() => {
        if (invoiceId === "") {
            setResult({ status: 'loaded', result: { status: InvoiceStatus.NOT_SENT }})
            return
        }
        console.log('running retrieveInvoiceStatus')
        callFirebaseFunction('retrieveInvoiceStatus', firebase)({ appointmentId: appointment.id })
            .then(result => {
                setResult({ status: 'loaded', result: result.data })
            })
            .catch((error) => {
                setResult({ status: 'error', error })
            })
    }, [])

    return [result, setResult]
}

export default useInvoiceStatus