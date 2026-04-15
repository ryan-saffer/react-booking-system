import { useParams as useReactRouterParams, useSearchParams } from 'react-router-dom'

export function useParams() {
    const { appointmentTypeId } = useReactRouterParams()
    const [searchParams] = useSearchParams()

    const calendarId = parseInt(searchParams.get('calendarId') || '')
    const classId = parseInt(searchParams.get('classId') || '')
    const classTime = decodeURIComponent(searchParams.get('classTime') || '')
    const className = decodeURIComponent(searchParams.get('className') || '')

    if (!!appointmentTypeId && !!calendarId && !!classId && !!classTime && !!className) {
        return { appointmentTypeId: parseInt(appointmentTypeId), calendarId, classId, classTime, className }
    }

    return null
}
