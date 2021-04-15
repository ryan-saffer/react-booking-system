import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { Acuity } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../Firebase'
import { callAcuityClient } from '../../utilities/firebase/functions'

interface UseFetchAppointmentProps {
    setLoading: Dispatch<SetStateAction<boolean>>,
    appointmentTypeId: number,
    calendarId: number,
    classId: number,
    sorter?: (a: Acuity.Appointment, b: Acuity.Appointment) => 0 | 1 | -1
}

const useFetchAppointments = (props: UseFetchAppointmentProps) => {

    const {
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        sorter
    } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointments, setAppointments] = useState<Acuity.Appointment[] | null>([])

    useEffect(
        () => {
            const fetchClients = (data: Acuity.Client.FetchAppointmentsParams) => {
                callAcuityClient('getAppointments', firebase)({ ...data })
                    .then(result => {
                        let filteredResults = result.data.filter(x => x.classID === classId)
                        if (sorter) {
                            filteredResults = filteredResults.sort(sorter)
                        }
                        setAppointments(filteredResults.length === 0 ? null : filteredResults)
                        setLoading(false)
                    })
                    .catch(() => {
                        setLoading(false)
                    })
            }

            if (firebase.auth.currentUser) {
                fetchClients({ appointmentTypeID: appointmentTypeId, calendarID: calendarId })
            }
        },
        [firebase.auth.currentUser]
    )

    return appointments
}

export default useFetchAppointments