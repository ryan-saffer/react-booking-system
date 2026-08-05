import { router } from '@/app/trpc/trpc'
import {
    generateCapacityReport,
    generateCapacityReportInputSchema,
} from '@/features/reports/core/generate-capacity-report'
import {
    generateHolidayProgramCapacityReport,
    generateHolidayProgramCapacityReportInputSchema,
} from '@/features/reports/core/generate-holiday-program-capacity-report'

import { reportReadProcedure } from './trpc.reports-procedures'

export const reportsRouter = router({
    generateCapacityReport: reportReadProcedure
        .input(generateCapacityReportInputSchema)
        .mutation(({ input }) => generateCapacityReport(input)),
    generateHolidayProgramCapacityReport: reportReadProcedure
        .input(generateHolidayProgramCapacityReportInputSchema)
        .query(({ input }) => generateHolidayProgramCapacityReport(input)),
})
