import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import Firebase, { FirebaseContext } from '../Firebase'

import { Acuity, InvoiceStatus, InvoiceStatusWithUrl } from 'fizz-kidz'
import { callFirebaseFunction } from '../../utilities/firebase/functions'


const useInvoiceStatus = (appointment: Acuity.Appointment): [InvoiceStatusWithUrl, Dispatch<SetStateAction<InvoiceStatusWithUrl>>] => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [result, setResult] = useState<InvoiceStatusWithUrl>({ status: InvoiceStatus.LOADING })

    const invoiceId = Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.INVOICE, Acuity.Constants.FormFields.INVOICE_ID)

    useEffect(() => {
        if (invoiceId === "") {
            setResult({ status: InvoiceStatus.NOT_SENT })
            return
        }
        console.log('running retrieveInvoiceStatus')
        callFirebaseFunction('retrieveInvoiceStatus', firebase)({ appointmentId: appointment.id })
            .then(result => {
                setResult(result.data)
            })
            .catch(() => {
                setResult({ status: InvoiceStatus.ERROR })
            })
    }, [])

    return [result, setResult]
}

export default useInvoiceStatus