import { z } from 'zod'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export const listInventoryUsageRulesInputSchema = z
    .object({
        includeArchived: z.boolean().optional(),
    })
    .optional()

export type ListInventoryUsageRulesInput = z.infer<typeof listInventoryUsageRulesInputSchema>

export async function listInventoryUsageRules(input: ListInventoryUsageRulesInput) {
    return DatabaseClient.listInventoryUsageRules({ includeArchived: input?.includeArchived })
}
