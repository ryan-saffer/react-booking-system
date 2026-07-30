export const ANAPHYLAXIS_PLAN_PREFIXES = {
    HOLIDAY_PROGRAM: 'anaphylaxisPlans/holiday-program-',
    PRESCHOOL_PROGRAM_V2: 'anaphylaxisPlans/preschool-v2-child-',
} as const

/** Validates that a storage path belongs to the expected program and is not nested. */
export function isValidAnaphylaxisPlanPath(storagePath: string, allowedPrefix: string) {
    return storagePath.startsWith(allowedPrefix) && !storagePath.slice('anaphylaxisPlans/'.length).includes('/')
}
