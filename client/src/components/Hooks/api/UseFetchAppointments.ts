import { AcuityTypes } from 'fizz-kidz'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { trpc } from '@utils/trpc'

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

    const [appointments, setAppointments] = useState<AcuityTypes.Api.Appointment[] | null>([])

    const searchForAppointmentsMutation = trpc.acuity.searchForAppointments.useMutation()

    useEffect(() => {
        const fetchClients = (data: AcuityTypes.Client.FetchAppointmentsParams) => {
            searchForAppointmentsMutation
                .mutateAsync(data)
                .then((result) => {
                    const appointments = result
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
