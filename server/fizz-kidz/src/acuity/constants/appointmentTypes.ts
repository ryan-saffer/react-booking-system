export const AppointmentTypes = {
    TEST_HOLIDAY_PROGRAM: 15026605,
    HOLIDAY_PROGRAM: 11036399,
    GEELONG_OPENING: 75381458,
} as const

export type AppointmentTypeValue = (typeof AppointmentTypes)[keyof typeof AppointmentTypes]
