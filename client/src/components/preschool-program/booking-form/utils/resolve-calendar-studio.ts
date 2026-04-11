import { AcuityUtilities } from 'fizz-kidz'
import type { StudioOrTest } from 'fizz-kidz'

export function resolveCalendarStudio(calendarId: number | undefined): StudioOrTest | null {
    if (!calendarId) return null

    try {
        return AcuityUtilities.getStudioByCalendarId(calendarId)
    } catch {
        return null
    }
}
