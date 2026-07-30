import { useQuery } from '@tanstack/react-query'

import { useOrg } from '@components/Session/use-org'
import { useTRPC } from '@utils/trpc'

export function useInventoryUsageRules() {
    const trpc = useTRPC()
    const { hasPermission } = useOrg()
    const canEdit = hasPermission('inventory:write')
    const usageRulesQuery = useQuery(
        trpc.inventory.listUsageRules.queryOptions({ includeArchived: true }, { enabled: canEdit })
    )

    return {
        canEdit,
        isLoading: usageRulesQuery.isPending,
        usageRules: (usageRulesQuery.data ?? []).sort((a, b) => a.inventoryKey.localeCompare(b.inventoryKey)),
        usageRulesQuery,
    }
}
