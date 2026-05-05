import { TRPCError } from '@trpc/server'
import { DateTime } from 'luxon'
import { z } from 'zod'

import { STUDIOS } from 'fizz-kidz'
import type { Studio, StudioOrMaster } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

const REPORT_ZONE = 'Australia/Melbourne'

const studioOrMasterSchema = z.custom<StudioOrMaster>(
    (value) => typeof value === 'string' && (value === 'master' || STUDIOS.includes(value as Studio))
)

export const generateCapacityReportInputSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    availableSlots: z.number().int().positive(),
    studio: studioOrMasterSchema,
})

export type GenerateCapacityReportInput = z.infer<typeof generateCapacityReportInputSchema>

export type GenerateCapacityReportResponse = {
    startDate: string
    endDate: string
    studio: StudioOrMaster
    results: CapacityReportStudioResult[]
}

type CapacityReportStudioResult = {
    studio: Studio
    bookedSlots: number
    availableSlots: number
    utilisationPercentage: number
}

const throwReportError = (message: string, errorCode: string): never => {
    throw new TRPCError({ code: 'BAD_REQUEST', message, cause: { errorCode } })
}

export async function generateCapacityReport(
    input: GenerateCapacityReportInput
): Promise<GenerateCapacityReportResponse> {
    const startDate = DateTime.fromISO(input.startDate, { zone: REPORT_ZONE }).startOf('day')
    const endDate = DateTime.fromISO(input.endDate, { zone: REPORT_ZONE }).startOf('day')

    if (!startDate.isValid || !endDate.isValid) {
        throwReportError('date range is invalid', 'invalid-date')
    }

    if (startDate > endDate) {
        throwReportError('start date must come before the end date', 'invalid-range')
    }

    if (input.availableSlots < 1) {
        throwReportError('available slots must be greater than 0', 'invalid-slots')
    }

    const bookings = (
        await DatabaseClient.getPartyBookingsForCapacityReport({
            startDate: startDate.toJSDate(),
            endDate: endDate.plus({ days: 1 }).toJSDate(),
            studio: input.studio,
        })
    ).filter((booking) => booking.type === 'studio')
    const studios = input.studio === 'master' ? STUDIOS : [input.studio]

    return {
        startDate: input.startDate,
        endDate: input.endDate,
        studio: input.studio,
        results: studios.map((studio) => {
            const bookedSlots = bookings.filter((booking) => booking.location === studio).length

            return {
                studio,
                bookedSlots,
                availableSlots: input.availableSlots,
                utilisationPercentage: (bookedSlots / input.availableSlots) * 100,
            }
        }),
    }
}
