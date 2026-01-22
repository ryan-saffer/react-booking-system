import { doc, getDoc } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'

import type { AfterSchoolEnrolment, Service } from 'fizz-kidz'

import type Firebase from '@components/Firebase'
import { FirebaseContext } from '@components/Firebase'


const useFetchAfterSchoolProgramEnrolment = (id: string) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<AfterSchoolEnrolment>>({ status: 'loading' })

    useEffect(() => {
        async function fetchEnrolment() {
            try {
                const result = await getDoc(doc(firebase.db, 'afterSchoolEnrolments', id))
                if (result.exists()) {
                    setService({ status: 'loaded', result: result.data() as AfterSchoolEnrolment })
                } else {
                    setService({ status: 'error', error: 'appointment not found' })
                }
            } catch (error) {
                setService({ status: 'error', error })
            }
        }

        fetchEnrolment()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return service
}

export default useFetchAfterSchoolProgramEnrolment
