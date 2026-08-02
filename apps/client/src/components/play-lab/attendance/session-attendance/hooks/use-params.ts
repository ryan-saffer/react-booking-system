import { useParams as useParamsReactRouter, useSearchParams } from 'react-router-dom'

/**
 * Grabs the urls path and search parameters required to render the play lab session attendance page.
 *
 * @returns the parameters if they exist, otherwise null
 */
export function useParams() {
    const { appointmentTypeId } = useParamsReactRouter()
    const [searchParams] = useSearchParams()

    const calendarId = parseInt(searchParams.get('calendarId') || '')
    const classId = parseInt(searchParams.get('classId') || '')
    const classTime = decodeURIComponent(searchParams.get('classTime') || '')
    const className = decodeURIComponent(searchParams.get('className') || '')

    if (!!appointmentTypeId && !!calendarId && !!classId && !!classTime && !!className) {
        return { appointmentTypeId: parseInt(appointmentTypeId), calendarId, classId, classTime, className }
    } else {
        return null
    }
}
