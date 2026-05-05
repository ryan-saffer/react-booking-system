import { generateCapacityReport, generateCapacityReportInputSchema } from '@/reports/core/generate-capacity-report'
import { authenticatedProcedure, router } from '@/trpc/trpc'

export const reportsRouter = router({
    generateCapacityReport: authenticatedProcedure
        .input(generateCapacityReportInputSchema)
        .mutation(({ input }) => generateCapacityReport(input)),
})
