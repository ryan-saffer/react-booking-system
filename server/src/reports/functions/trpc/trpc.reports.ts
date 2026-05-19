import { generateCapacityReport, generateCapacityReportInputSchema } from '@/reports/core/generate-capacity-report'
import {
    generateHolidayProgramCapacityReport,
    generateHolidayProgramCapacityReportInputSchema,
} from '@/reports/core/generate-holiday-program-capacity-report'
import { router } from '@/trpc/trpc'

import { reportReadProcedure } from './trpc.reports-procedures'

export const reportsRouter = router({
    generateCapacityReport: reportReadProcedure
        .input(generateCapacityReportInputSchema)
        .mutation(({ input }) => generateCapacityReport(input)),
    generateHolidayProgramCapacityReport: reportReadProcedure
        .input(generateHolidayProgramCapacityReportInputSchema)
        .query(({ input }) => generateHolidayProgramCapacityReport(input)),
})
