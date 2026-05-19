import { z } from 'zod'

import { AcuityConstants, STUDIOS } from 'fizz-kidz'
import type { Studio, StudioOrMaster } from 'fizz-kidz'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { mergeAcuityWithStoryblok } from '@/acuity/core/merge-storyblok-with-acuity'
import { env } from '@/init'

const studioOrMasterSchema = z.custom<StudioOrMaster>(
    (value) => typeof value === 'string' && (value === 'master' || STUDIOS.includes(value as Studio))
)

export const generateHolidayProgramCapacityReportInputSchema = z.object({
    studio: studioOrMasterSchema,
})

export type GenerateHolidayProgramCapacityReportInput = z.infer<typeof generateHolidayProgramCapacityReportInputSchema>

export type HolidayProgramCapacityReportResponse = {
    studio: StudioOrMaster
    generatedAt: string
    overall: HolidayProgramCapacitySummary
    studios: HolidayProgramCapacityStudioResult[]
}

export type HolidayProgramCapacitySummary = {
    bookedSpots: number
    totalCapacity: number
    slotsAvailable: number
    utilisationPercentage: number
}

export type HolidayProgramCapacityStudioResult = HolidayProgramCapacitySummary & {
    studio: Studio
    classes: HolidayProgramCapacityClassResult[]
}

export type HolidayProgramCapacityClassResult = HolidayProgramCapacitySummary & {
    classId: number
    appointmentTypeId: number
    calendarId: number
    studio: Studio
    name: string
    title?: string
    time: string
}

const appointmentTypeIds =
    env === 'prod'
        ? [AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM]
        : [AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM]

export async function generateHolidayProgramCapacityReport(
    input: GenerateHolidayProgramCapacityReportInput
): Promise<HolidayProgramCapacityReportResponse> {
    const acuity = await AcuityClient.getInstance()
    const studios = input.studio === 'master' ? STUDIOS : [input.studio]
    const calendarIdsByStudio = new Map(
        Object.entries(AcuityConstants.StoreCalendars).map(([studio, id]) => [id, studio as Studio])
    )
    const allowedCalendarIds = new Set(studios.map((studio) => AcuityConstants.StoreCalendars[studio]))

    const classes = (await mergeAcuityWithStoryblok(await acuity.getClasses(appointmentTypeIds, true, Date.now())))
        .filter((klass) => allowedCalendarIds.has(klass.calendarID))
        .sort((a, b) => a.time.localeCompare(b.time))

    const classResults = await Promise.all(
        classes.map(async (klass): Promise<HolidayProgramCapacityClassResult> => {
            const appointments = await acuity.searchForAppointments({
                appointmentTypeId: klass.appointmentTypeID,
                calendarId: klass.calendarID,
                classId: klass.id,
                classTime: klass.time,
                maxResults: 1000,
            })
            const bookedSpots = appointments.length
            const totalCapacity = bookedSpots + klass.slotsAvailable
            const studio = calendarIdsByStudio.get(klass.calendarID)!

            return {
                classId: klass.id,
                appointmentTypeId: klass.appointmentTypeID,
                calendarId: klass.calendarID,
                studio,
                name: klass.name,
                ...(klass.title ? { title: klass.title } : {}),
                time: klass.time,
                bookedSpots,
                totalCapacity,
                slotsAvailable: klass.slotsAvailable,
                utilisationPercentage: calculateUtilisation(bookedSpots, totalCapacity),
            }
        })
    )

    const studioResults = studios.map((studio): HolidayProgramCapacityStudioResult => {
        const studioClasses = classResults.filter((klass) => klass.studio === studio)
        const summary = summarise(studioClasses)

        return {
            studio,
            ...summary,
            classes: studioClasses,
        }
    })

    return {
        studio: input.studio,
        generatedAt: new Date().toISOString(),
        overall: summarise(studioResults),
        studios: studioResults,
    }
}

function summarise(rows: HolidayProgramCapacitySummary[]): HolidayProgramCapacitySummary {
    const bookedSpots = rows.reduce((total, row) => total + row.bookedSpots, 0)
    const totalCapacity = rows.reduce((total, row) => total + row.totalCapacity, 0)
    const slotsAvailable = rows.reduce((total, row) => total + row.slotsAvailable, 0)

    return {
        bookedSpots,
        totalCapacity,
        slotsAvailable,
        utilisationPercentage: calculateUtilisation(bookedSpots, totalCapacity),
    }
}

function calculateUtilisation(bookedSpots: number, totalCapacity: number) {
    if (totalCapacity === 0) return 0
    return (bookedSpots / totalCapacity) * 100
}
