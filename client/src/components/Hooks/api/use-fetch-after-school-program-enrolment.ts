import type { AfterSchoolEnrolment, Service } from 'fizz-kidz'
import { useContext, useEffect, useState } from 'react'

import type Firebase from '@components/Firebase'
import { FirebaseContext } from '@components/Firebase'

const useFetchAfterSchoolProgramEnrolment = (id: string) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<AfterSchoolEnrolment>>({ status: 'loading' })

    useEffect(() => {
        firebase.db
            .doc(`afterSchoolEnrolments/${id}`)
            .get()
            .then((result) => {
                if (result.exists) {
                    setService({ status: 'loaded', result: result.data() as AfterSchoolEnrolment })
                } else {
                    setService({ status: 'error', error: 'appointment not found' })
                }
            })
            .catch((error) => setService({ status: 'error', error }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return service
}

export default useFetchAfterSchoolProgramEnrolment
