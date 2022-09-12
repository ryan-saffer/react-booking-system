import { useState, useEffect, useContext } from 'react'
import { Acuity, Service } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../Firebase'
import { callAcuityClientV2 } from '../../utilities/firebase/functions'

const useUpdateScienceClubEnrolment = (props: Acuity.Client.UpdateScienceEnrolmentParams): Service<Acuity.Appointment[]> => {

    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<Acuity.Appointment[]>>({ status: 'loading' })

    useEffect(
        () => {
            function updateEnrolment(data: Acuity.Client.UpdateScienceEnrolmentParams) {
                callAcuityClientV2('updateEnrolment', firebase)({ ...data })
                    .then(appointments => {
                        setService({ status: 'loaded', result: appointments.data })
                    })
                    .catch(error => {
                        setService({ status: 'error', error })
                    })
            }
            updateEnrolment({ ...props })
        },
        []
    )

    return service
}

export default useUpdateScienceClubEnrolment