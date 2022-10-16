import React, { useContext, useEffect, useState } from 'react'
import { ScienceEnrolment, Service } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../Firebase'

const useFetchScienceAppointment = (id: string) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<ScienceEnrolment>>({ status: 'loading' })

    useEffect(() => {
        firebase.db
            .doc(`scienceAppointments/${id}`)
            .get()
            .then((result) => {
                if (result.exists) {
                    setService({ status: 'loaded', result: result.data() as ScienceEnrolment })
                } else {
                    setService({ status: 'error', error: 'appointment not found' })
                }
            })
            .catch((error) => setService({ status: 'error', error }))
    }, [])

    return service
}

export default useFetchScienceAppointment
