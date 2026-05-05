import type { FirestoreBooking, StudioOrMaster } from 'fizz-kidz'

type GetPartyBookingsForCapacityReportInput = { startDate: Date; endDate: Date; studio: StudioOrMaster }

type MockDatabaseClient = {
    getPartyBookingsForCapacityReport: (input: GetPartyBookingsForCapacityReportInput) => Promise<FirestoreBooking[]>
}

const unmockedMethod = (methodName: string) => async () => {
    throw new Error(`DatabaseClient.${methodName} mock has not been configured for this test.`)
}

export const mockDatabaseClient: MockDatabaseClient = {
    getPartyBookingsForCapacityReport: unmockedMethod('getPartyBookingsForCapacityReport'),
}

export function resetDatabaseClientMock() {
    mockDatabaseClient.getPartyBookingsForCapacityReport = unmockedMethod('getPartyBookingsForCapacityReport')
}

const databaseClientModulePath = require.resolve('@/firebase/DatabaseClient')

require.cache[databaseClientModulePath] = {
    id: databaseClientModulePath,
    filename: databaseClientModulePath,
    loaded: true,
    exports: { DatabaseClient: mockDatabaseClient },
    children: [],
    paths: [],
} as unknown as NodeJS.Module
