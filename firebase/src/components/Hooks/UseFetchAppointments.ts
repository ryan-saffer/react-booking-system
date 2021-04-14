import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { Acuity } from 'fizz-kidz'

import Firebase, { FirebaseContext } from '../Firebase'

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
                firebase.functions.httpsCallable('acuityClient')({
                    auth: firebase.auth.currentUser?.toJSON(),
                    data: { method: 'getAppointments', ...data }
                }).then(result => {
                    const appointments = result.data as Acuity.Appointment[]
                    var results = appointments.filter(x => x.classID === classId)
                    if (sorter) {
                        results = results.sort(sorter)
                    }
                    setAppointments(results.length === 0 ? null : results)
                    setLoading(false)
                }).catch(err => {
                    console.error(err)
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