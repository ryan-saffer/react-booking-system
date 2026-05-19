import { deepStrictEqual, strictEqual } from 'assert'
import { createRequire } from 'module'

import { AcuityConstants, STUDIOS } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import type * as HolidayProgramCapacityReportModule from '../generate-holiday-program-capacity-report'

type MockClass = AcuityTypes.Api.Class & { title?: string }

const createClass = (input: {
    id: number
    calendarID: number
    slotsAvailable: number
    time: string
    name?: string
}): MockClass =>
    ({
        appointmentTypeID: AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
        calendar: 'Calendar',
        description: '',
        duration: 180,
        price: '95',
        name: input.name ?? 'Holiday Program',
        ...input,
    }) as MockClass

class MockAcuityClient {
    classes: MockClass[] = []
    appointmentCountsByClass = new Map<number, number>()

    async getClasses(): Promise<MockClass[]> {
        return this.classes
    }

    async searchForAppointments(
        input: AcuityTypes.Client.FetchAppointmentsParams
    ): Promise<AcuityTypes.Api.Appointment[]> {
        const count = input.classId ? (this.appointmentCountsByClass.get(input.classId) ?? 0) : 0
        return Array.from({ length: count }, (_, index) => ({ id: index + 1 })) as AcuityTypes.Api.Appointment[]
    }
}

const mockAcuityClient = new MockAcuityClient()
let mergeAcuityWithStoryblok = async (classes: MockClass[]) => classes
const testRequire = createRequire(
    `${process.cwd()}/src/reports/core/__tests__/generate-holiday-program-capacity-report.test.ts`
)

testRequire.cache[testRequire.resolve('@/init')] = {
    id: testRequire.resolve('@/init'),
    filename: testRequire.resolve('@/init'),
    loaded: true,
    exports: { env: 'dev' },
    children: [],
    paths: [],
} as unknown as NodeJS.Module

testRequire.cache[testRequire.resolve('@/acuity/core/acuity-client')] = {
    id: testRequire.resolve('@/acuity/core/acuity-client'),
    filename: testRequire.resolve('@/acuity/core/acuity-client'),
    loaded: true,
    exports: {
        AcuityClient: {
            getInstance: async () => mockAcuityClient,
        },
    },
    children: [],
    paths: [],
} as unknown as NodeJS.Module

testRequire.cache[testRequire.resolve('@/acuity/core/merge-storyblok-with-acuity')] = {
    id: testRequire.resolve('@/acuity/core/merge-storyblok-with-acuity'),
    filename: testRequire.resolve('@/acuity/core/merge-storyblok-with-acuity'),
    loaded: true,
    exports: {
        mergeAcuityWithStoryblok: (classes: MockClass[]) => mergeAcuityWithStoryblok(classes),
    },
    children: [],
    paths: [],
} as unknown as NodeJS.Module

const { generateHolidayProgramCapacityReport, generateHolidayProgramCapacityReportInputSchema } = testRequire(
    '../generate-holiday-program-capacity-report'
) as typeof HolidayProgramCapacityReportModule

describe('generateHolidayProgramCapacityReport', () => {
    beforeEach(() => {
        mockAcuityClient.classes = []
        mockAcuityClient.appointmentCountsByClass.clear()
        mergeAcuityWithStoryblok = async (classes) => classes
    })

    it('calculates class and studio capacity for one studio', async () => {
        mockAcuityClient.classes = [
            createClass({
                id: 1,
                calendarID: AcuityConstants.StoreCalendars.balwyn,
                slotsAvailable: 20,
                time: '2026-04-01T09:00:00+10:00',
            }),
            createClass({
                id: 2,
                calendarID: AcuityConstants.StoreCalendars.cheltenham,
                slotsAvailable: 15,
                time: '2026-04-01T09:00:00+10:00',
            }),
        ]
        mockAcuityClient.appointmentCountsByClass.set(1, 5)
        mockAcuityClient.appointmentCountsByClass.set(2, 10)

        const result = await generateHolidayProgramCapacityReport({ studio: 'balwyn' })

        strictEqual(result.studio, 'balwyn')
        strictEqual(result.studios.length, 1)
        deepStrictEqual(result.overall, {
            bookedSpots: 5,
            totalCapacity: 25,
            slotsAvailable: 20,
            utilisationPercentage: 20,
        })
        deepStrictEqual(result.studios[0], {
            studio: 'balwyn',
            bookedSpots: 5,
            totalCapacity: 25,
            slotsAvailable: 20,
            utilisationPercentage: 20,
            classes: [
                {
                    classId: 1,
                    appointmentTypeId: AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
                    calendarId: AcuityConstants.StoreCalendars.balwyn,
                    studio: 'balwyn',
                    name: 'Holiday Program',
                    time: '2026-04-01T09:00:00+10:00',
                    bookedSpots: 5,
                    totalCapacity: 25,
                    slotsAvailable: 20,
                    utilisationPercentage: 20,
                },
            ],
        })
    })

    it('returns all studios and an overall summary for master', async () => {
        mockAcuityClient.classes = [
            createClass({
                id: 1,
                calendarID: AcuityConstants.StoreCalendars.balwyn,
                slotsAvailable: 20,
                time: '2026-04-01T09:00:00+10:00',
            }),
            createClass({
                id: 2,
                calendarID: AcuityConstants.StoreCalendars.cheltenham,
                slotsAvailable: 5,
                time: '2026-04-02T09:00:00+10:00',
            }),
        ]
        mockAcuityClient.appointmentCountsByClass.set(1, 5)
        mockAcuityClient.appointmentCountsByClass.set(2, 15)

        const result = await generateHolidayProgramCapacityReport({ studio: 'master' })

        strictEqual(result.studios.length, STUDIOS.length)
        deepStrictEqual(result.overall, {
            bookedSpots: 20,
            totalCapacity: 45,
            slotsAvailable: 25,
            utilisationPercentage: (20 / 45) * 100,
        })
        deepStrictEqual(
            result.studios
                .filter((studioResult) => studioResult.totalCapacity > 0)
                .map(({ studio, bookedSpots, totalCapacity, slotsAvailable }) => ({
                    studio,
                    bookedSpots,
                    totalCapacity,
                    slotsAvailable,
                })),
            [
                { studio: 'balwyn', bookedSpots: 5, totalCapacity: 25, slotsAvailable: 20 },
                { studio: 'cheltenham', bookedSpots: 15, totalCapacity: 20, slotsAvailable: 5 },
            ]
        )
    })

    it('validates the trpc input schema', () => {
        strictEqual(generateHolidayProgramCapacityReportInputSchema.safeParse({ studio: 'master' }).success, true)
        strictEqual(generateHolidayProgramCapacityReportInputSchema.safeParse({ studio: 'balwyn' }).success, true)
        strictEqual(generateHolidayProgramCapacityReportInputSchema.safeParse({ studio: 'richmond' }).success, false)
    })

    it('uses the merged Storyblok title when available', async () => {
        mockAcuityClient.classes = [
            createClass({
                id: 1,
                calendarID: AcuityConstants.StoreCalendars.balwyn,
                slotsAvailable: 20,
                time: '2026-04-01T09:00:00+10:00',
            }),
        ]
        mergeAcuityWithStoryblok = async (classes) => classes.map((klass) => ({ ...klass, title: 'Slime Spectacular' }))

        const result = await generateHolidayProgramCapacityReport({ studio: 'balwyn' })

        strictEqual(result.studios[0].classes[0].title, 'Slime Spectacular')
    })
})
