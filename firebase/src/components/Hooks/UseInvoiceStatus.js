import { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../Firebase'

const useInvoiceStatus = appointment => {

    const firebase = useContext(FirebaseContext)

    const [result, setResult] = useState({ status: "LOADING", url: null })

    useEffect(() => {
        console.log('running retrieveInvoiceStatus')
        firebase.functions.httpsCallable('retrieveInvoiceStatus')({
            appointmentId: appointment.id
        })
        .then(result => {
            setResult(result.data)
        })
        .catch(err => {
            console.error(
                'error running :retrieveInvoiceStatus:',
                '--statusCode:', err.code,
                '--message:', err.message,
                '--details:', err.details
            )
            setResult({ status: "ERROR" })
        })
    }, [])

    return result
}

export default useInvoiceStatus