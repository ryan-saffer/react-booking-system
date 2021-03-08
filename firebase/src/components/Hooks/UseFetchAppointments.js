import { useState, useEffect, useContext } from 'react'

import { FirebaseContext } from '../Firebase'

const useFetchAppointments = props => {

    const {
        setLoading,
        appointmentTypeID,
        calendarID,
        classID,
        sorter
    } = props

    const firebase = useContext(FirebaseContext)

    const [appointments, setAppointments] = useState([])

    useEffect(
        () => {
            const fetchClients = data => {
                firebase.functions.httpsCallable('acuityClient')({
                    auth: firebase.auth.currentUser.toJSON(),
                    data: { method: 'getAppointments', ...data }
                }).then(result => {
                    console.log(result)
                    var results = result.data.filter(x => x.classID === classID)
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
                fetchClients({ appointmentTypeID, calendarID })
            }
        },
        [firebase.auth.currentUser]
    )

    return appointments
}

export default useFetchAppointments