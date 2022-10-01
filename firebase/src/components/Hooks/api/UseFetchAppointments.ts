import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { Acuity } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'

interface UseFetchAppointmentsProps {
    setLoading: Dispatch<SetStateAction<boolean>>
    appointmentTypeId: number
    calendarId: number
    classId: number
    sorter?: (a: Acuity.Appointment, b: Acuity.Appointment) => 0 | 1 | -1
}

const useFetchAppointments = (props: UseFetchAppointmentsProps) => {
    const { setLoading, appointmentTypeId, calendarId, classId, sorter } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointments, setAppointments] = useState<Acuity.Appointment[] | null>([])

    useEffect(() => {
        const fetchClients = (data: Acuity.Client.FetchAppointmentsParams) => {
            callAcuityClientV2(
                'searchForAppointments',
                firebase
            )({ ...data })
                .then((result) => {
                    let filteredResults = result.data.filter((x) => x.classID === classId)
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

        fetchClients({ appointmentTypeId, calendarId })
    }, [])

    return appointments
}

export default useFetchAppointments
