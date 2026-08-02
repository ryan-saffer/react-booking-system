import { DatabaseClient } from '@/firebase/DatabaseClient'

import { inventoryUsageRuleInputSchema } from './inventory.schemas'
import { buildInventoryUsageRule } from './inventory.usage-rules.utils'

import type { z } from 'zod'

export const createInventoryUsageRuleInputSchema = inventoryUsageRuleInputSchema

export type CreateInventoryUsageRuleInput = z.infer<typeof createInventoryUsageRuleInputSchema>

export async function createInventoryUsageRule(input: CreateInventoryUsageRuleInput) {
    const now = new Date()
    const ruleId = await DatabaseClient.createInventoryUsageRuleId()
    const rule = buildInventoryUsageRule(input, { id: ruleId, now })

    await DatabaseClient.setInventoryDocuments({ usageRules: [rule] })

    return DatabaseClient.getInventoryUsageRule(ruleId)
}
