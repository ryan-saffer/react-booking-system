import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { AcuityTypes } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClient } from '../../../utilities/firebase/functions'

interface UseFetchAppointmentsProps {
    setLoading: Dispatch<SetStateAction<boolean>>
    appointmentTypeId: number
    calendarId: number
    classId: number
    classTime?: string
    sorter?: (a: AcuityTypes.Api.Appointment, b: AcuityTypes.Api.Appointment) => 0 | 1 | -1
}

const useFetchAppointments = (props: UseFetchAppointmentsProps) => {
    const { setLoading, appointmentTypeId, calendarId, classId, sorter, classTime } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointments, setAppointments] = useState<AcuityTypes.Api.Appointment[] | null>([])

    useEffect(() => {
        const fetchClients = (data: AcuityTypes.Client.FetchAppointmentsParams) => {
            callAcuityClient(
                'searchForAppointments',
                firebase
            )({ ...data })
                .then((result) => {
                    const appointments = result.data
                    if (sorter) {
                        appointments.sort(sorter)
                    }
                    setAppointments(appointments.length === 0 ? null : appointments)
                    setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                })
        }

        fetchClients({ appointmentTypeId, calendarId, classId, classTime })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return appointments
}

export default useFetchAppointments
