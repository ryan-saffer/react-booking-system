import { useState, useEffect, useContext } from 'react'
import { Acuity, Types } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../Firebase'
import { callAcuityClientV2 } from '../../utilities/firebase/functions'

const useUpdateScienceClubEnrolment = (props: Acuity.Client.UpdateScienceEnrolmentParams): Types.Functions.Service<Acuity.Appointment[]> => {

    const {
        email,
        appointmentTypeId,
        childName,
        continuing,
    } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Types.Functions.Service<Acuity.Appointment[]>>({ status: 'loading' })

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
            updateEnrolment({ email, appointmentTypeId, childName, continuing })
        },
        []
    )

    return service
}

export default useUpdateScienceClubEnrolment