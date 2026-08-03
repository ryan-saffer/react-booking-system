import { AcuityUtilities } from '@fizz-kidz/core'
import type { StudioOrTest } from '@fizz-kidz/core'

export function resolveCalendarStudio(calendarId: number | undefined): StudioOrTest | null {
    if (!calendarId) return null

    try {
        return AcuityUtilities.getStudioByCalendarId(calendarId)
    } catch {
        return null
    }
}
