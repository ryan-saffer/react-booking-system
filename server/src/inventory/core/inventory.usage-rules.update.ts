import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { inventoryUsageRuleInputSchema } from './inventory.schemas'
import { buildInventoryUsageRule } from './inventory.usage-rules.utils'

export const updateInventoryUsageRuleInputSchema = z.object({
    ruleId: z.string().min(1),
    rule: inventoryUsageRuleInputSchema,
})

export type UpdateInventoryUsageRuleInput = z.infer<typeof updateInventoryUsageRuleInputSchema>

export async function updateInventoryUsageRule(input: UpdateInventoryUsageRuleInput) {
    const existingRule = await DatabaseClient.getInventoryUsageRule(input.ruleId)
    const nextRule = buildInventoryUsageRule(input.rule, { id: input.ruleId, now: new Date() })

    await DatabaseClient.setInventoryDocuments({ usageRules: [{ ...nextRule, createdAt: existingRule.createdAt }] })

    return DatabaseClient.getInventoryUsageRule(input.ruleId)
}
