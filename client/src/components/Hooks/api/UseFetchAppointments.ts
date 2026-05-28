import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { AcuityTypes } from 'fizz-kidz'

import { useTRPC } from '@utils/trpc'

import type { Dispatch, SetStateAction } from 'react'

interface UseFetchAppointmentsProps {
    setLoading: Dispatch<SetStateAction<boolean>>
    appointmentTypeId: number
    calendarId: number
    classId: number
    classTime?: string
    sorter?: (a: AcuityTypes.Api.Appointment, b: AcuityTypes.Api.Appointment) => 0 | 1 | -1
}

const useFetchAppointments = (props: UseFetchAppointmentsProps) => {
    const trpc = useTRPC()
    const { setLoading, appointmentTypeId, calendarId, classId, sorter, classTime } = props

    const [appointments, setAppointments] = useState<AcuityTypes.Api.Appointment[] | null>([])

    const searchForAppointmentsMutation = useMutation(trpc.acuity.searchForAppointmentsMutation.mutationOptions())

    useEffect(() => {
        let isCurrent = true

        const fetchClients = (data: AcuityTypes.Client.FetchAppointmentsParams) => {
            setLoading(true)
            setAppointments([])

            searchForAppointmentsMutation
                .mutateAsync(data)
                .then((result) => {
                    if (!isCurrent) return

                    const appointments = result
                    if (sorter) {
                        appointments.sort(sorter)
                    }
                    setAppointments(appointments.length === 0 ? null : appointments)
                    setLoading(false)
                })
                .catch(() => {
                    if (!isCurrent) return

                    setLoading(false)
                })
        }

        fetchClients({ appointmentTypeId, calendarId, classId, classTime })

        return () => {
            isCurrent = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointmentTypeId, calendarId, classId, classTime])

    return appointments
}

export default useFetchAppointments
