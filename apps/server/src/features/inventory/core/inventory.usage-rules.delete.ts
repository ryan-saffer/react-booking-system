import { z } from 'zod'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export const deleteInventoryUsageRuleInputSchema = z.object({
    ruleId: z.string().min(1),
})

export type DeleteInventoryUsageRuleInput = z.infer<typeof deleteInventoryUsageRuleInputSchema>

export async function deleteInventoryUsageRule(input: DeleteInventoryUsageRuleInput) {
    await DatabaseClient.deleteInventoryUsageRule(input.ruleId)
}
