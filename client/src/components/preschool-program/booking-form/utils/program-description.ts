import type { AcuityTypes } from 'fizz-kidz'

export function getProgramDescriptionLines(program: AcuityTypes.Api.AppointmentType) {
    return getProgramDescription(program.description)
}

function getProgramDescription(description: string) {
    try {
        const parsed = JSON.parse(description) as Record<string, string>
        return [parsed.day, parsed.time, parsed.ages, parsed.term, parsed.begins, parsed.location].filter(Boolean)
    } catch {
        return description
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
    }
}
