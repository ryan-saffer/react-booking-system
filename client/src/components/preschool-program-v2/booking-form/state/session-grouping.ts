import { DateTime } from 'luxon'

import type { LocalAcuityClass } from './cart-store'

export type SessionGroup = {
    key: string
    day: string
    time: string
    sortValue: number
    classes: LocalAcuityClass[]
    bookableClasses: LocalAcuityClass[]
    isFullTermBookable: boolean
}

export const TERM_BOUNDARY_GAP_DAYS = 14

type BaseSessionGroup = Omit<SessionGroup, 'key' | 'classes' | 'bookableClasses' | 'isFullTermBookable'> & {
    classes: LocalAcuityClass[]
}

export function groupClasses(classes: LocalAcuityClass[], now = new Date()) {
    const baseGroups = new Map<string, BaseSessionGroup>()

    classes.forEach((klass) => {
        const start = DateTime.fromJSDate(klass.time, { zone: 'Australia/Melbourne' })
        const key = `${start.weekday}-${start.toFormat('HH:mm')}`
        const existing = baseGroups.get(key)
        const group = existing ?? {
            day: start.toFormat('cccc'),
            time: start.toFormat('h:mm a'),
            sortValue: start.weekday * 1440 + start.hour * 60 + start.minute,
            classes: [],
        }

        group.classes.push(klass)
        baseGroups.set(key, group)
    })

    return Array.from(baseGroups.entries())
        .flatMap(([baseKey, group]) => splitIntoTermGroups(baseKey, group, now))
        .sort((a, b) => a.sortValue - b.sortValue)
}

function splitIntoTermGroups(baseKey: string, group: BaseSessionGroup, now: Date) {
    const sortedClasses = group.classes.sort((a, b) => a.time.getTime() - b.time.getTime())
    const termGroups: SessionGroup[] = []
    let currentTerm: LocalAcuityClass[] = []

    sortedClasses.forEach((klass) => {
        const previousClass = currentTerm.at(-1)
        const gapDays = previousClass
            ? DateTime.fromJSDate(klass.time).diff(DateTime.fromJSDate(previousClass.time), 'days').days
            : 0

        if (previousClass && gapDays >= TERM_BOUNDARY_GAP_DAYS) {
            termGroups.push(createTermGroup(baseKey, group, currentTerm, termGroups.length, now))
            currentTerm = []
        }

        currentTerm.push(klass)
    })

    if (currentTerm.length > 0) {
        termGroups.push(createTermGroup(baseKey, group, currentTerm, termGroups.length, now))
    }

    return termGroups
}

function createTermGroup(
    baseKey: string,
    group: Omit<SessionGroup, 'key' | 'classes' | 'bookableClasses' | 'isFullTermBookable'>,
    classes: LocalAcuityClass[],
    termIndex: number,
    now: Date
): SessionGroup {
    const bookableClasses = classes.filter((klass) => klass.time.getTime() > now.getTime())
    const firstClass = classes[0]

    return {
        ...group,
        key: `${baseKey}-${termIndex}-${firstClass.id}`,
        sortValue: firstClass.time.getTime(),
        classes,
        bookableClasses,
        isFullTermBookable:
            firstClass.time.getTime() > now.getTime() && classes.every((klass) => klass.slotsAvailable > 0),
    }
}
