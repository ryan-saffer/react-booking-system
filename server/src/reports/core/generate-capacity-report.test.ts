import { deepStrictEqual, rejects, strictEqual } from 'assert'

import type { FirestoreBooking, StudioOrMaster } from 'fizz-kidz'

import { mockDatabaseClient, resetDatabaseClientMock } from '@/test/mocks/database-client.mock'

import { generateCapacityReport, generateCapacityReportInputSchema } from './generate-capacity-report'

type CapacityReportQueryInput = { startDate: Date; endDate: Date; studio: StudioOrMaster }

const createBooking = (location: FirestoreBooking['location'], type: FirestoreBooking['type']): FirestoreBooking =>
    ({
        location,
        type,
    }) as FirestoreBooking

describe('generateCapacityReport', () => {
    afterEach(() => {
        resetDatabaseClientMock()
    })

    it('calculates utilisation for a single studio and ignores mobile parties', async () => {
        mockDatabaseClient.getPartyBookingsForCapacityReport = async () => [
            createBooking('balwyn', 'studio'),
            createBooking('balwyn', 'studio'),
            createBooking('balwyn', 'mobile'),
        ]

        const result = await generateCapacityReport({
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            availableSlots: 20,
            studio: 'balwyn',
        })

        deepStrictEqual(result, {
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            studio: 'balwyn',
            results: [
                {
                    studio: 'balwyn',
                    bookedSlots: 2,
                    availableSlots: 20,
                    utilisationPercentage: 10,
                },
            ],
        })
    })

    it('returns a row for each studio when reporting on master', async () => {
        mockDatabaseClient.getPartyBookingsForCapacityReport = async () => [
            createBooking('balwyn', 'studio'),
            createBooking('balwyn', 'studio'),
            createBooking('kingsville', 'studio'),
            createBooking('cheltenham', 'mobile'),
        ]

        const result = await generateCapacityReport({
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            availableSlots: 10,
            studio: 'master',
        })

        strictEqual(result.results.length, 6)
        deepStrictEqual(
            result.results.filter((studioResult) => studioResult.bookedSlots > 0),
            [
                {
                    studio: 'balwyn',
                    bookedSlots: 2,
                    availableSlots: 10,
                    utilisationPercentage: 20,
                },
                {
                    studio: 'kingsville',
                    bookedSlots: 1,
                    availableSlots: 10,
                    utilisationPercentage: 10,
                },
            ]
        )
    })

    it('queries the inclusive date range by using the next day as the exclusive end', async () => {
        const queryInputs: CapacityReportQueryInput[] = []
        mockDatabaseClient.getPartyBookingsForCapacityReport = async (input) => {
            queryInputs.push(input)
            return []
        }

        await generateCapacityReport({
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            availableSlots: 20,
            studio: 'balwyn',
        })

        const queryInput = queryInputs[0]
        strictEqual(queryInput.studio, 'balwyn')
        strictEqual(
            queryInput.startDate.toLocaleString('en-au', { timeZone: 'Australia/Melbourne' }),
            '01/04/2026, 12:00:00 am'
        )
        strictEqual(
            queryInput.endDate.toLocaleString('en-au', { timeZone: 'Australia/Melbourne' }),
            '01/05/2026, 12:00:00 am'
        )
    })

    it('rejects invalid report inputs', async () => {
        await rejects(
            generateCapacityReport({
                startDate: '2026-04-30',
                endDate: '2026-04-01',
                availableSlots: 20,
                studio: 'balwyn',
            })
        )

        await rejects(
            generateCapacityReport({
                startDate: 'not-a-date',
                endDate: '2026-04-01',
                availableSlots: 20,
                studio: 'balwyn',
            })
        )

        await rejects(
            generateCapacityReport({
                startDate: '2026-04-01',
                endDate: '2026-04-30',
                availableSlots: 0,
                studio: 'balwyn',
            })
        )
    })

    it('validates the trpc input schema', () => {
        strictEqual(
            generateCapacityReportInputSchema.safeParse({
                startDate: '2026-04-01',
                endDate: '2026-04-30',
                availableSlots: 20,
                studio: 'master',
            }).success,
            true
        )

        strictEqual(
            generateCapacityReportInputSchema.safeParse({
                startDate: '2026-04-01',
                endDate: '2026-04-30',
                availableSlots: 0,
                studio: 'balwyn',
            }).success,
            false
        )

        strictEqual(
            generateCapacityReportInputSchema.safeParse({
                startDate: '2026-04-01',
                endDate: '2026-04-30',
                availableSlots: 20,
                studio: 'richmond',
            }).success,
            false
        )
    })
})
