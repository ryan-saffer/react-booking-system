import { useParams as useParamsReactRouter, useSearchParams } from 'react-router-dom'

/**
 * Grabs the urls path and search parameters required to render the play lab session attendance page.
 *
 * @returns the parameters if they exist, otherwise it will return `{ isValid: false }`
 */
export function useParams() {
    const { appointmentTypeId } = useParamsReactRouter()
    const [searchParams] = useSearchParams()

    const calendarId = parseInt(searchParams.get('calendarId') || '')
    const classId = parseInt(searchParams.get('classId') || '')
    const classTime = decodeURIComponent(searchParams.get('classTime') || '')

    if (!!appointmentTypeId && !!calendarId && !!classId && !!classTime) {
        return {
            isValid: true,
            params: { appointmentTypeId: parseInt(appointmentTypeId), calendarId, classId, classTime },
        }
    } else {
        return { isValid: false }
    }
}
