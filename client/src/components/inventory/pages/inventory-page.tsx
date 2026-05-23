import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui-components/tabs'

import { InventoryCatalogueCard } from '../components/inventory/inventory-catalogue-card'
import { InventoryDialogs } from '../components/shared/inventory-dialogs'
import { InventoryPageHeader } from '../components/shared/inventory-page-header'
import { InventoryShoppingListCard } from '../components/shopping-list/inventory-shopping-list-card'
import { InventoryUsageRulesCard } from '../components/usage-rules/inventory-usage-rules-card'
import { useInventoryData } from '../hooks/use-inventory-data'

export function InventoryPage() {
    const { itemCount, trackedStockCount } = useInventoryData()

    return (
        <div className="twp min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#effcff] via-[#f7fbff] to-[#eef5ff] px-4 py-6 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <InventoryPageHeader itemCount={itemCount} trackedCount={trackedStockCount} />
                <Tabs defaultValue="inventory" className="flex flex-col gap-4">
                    <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white/80 p-1 shadow-sm ring-1 ring-slate-200 sm:w-fit">
                        <TabsTrigger
                            value="inventory"
                            className="rounded-xl px-4 py-2 data-[state=active]:bg-[#AC4390]/10 data-[state=active]:text-[#AC4390] data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-[#AC4390]/30"
                        >
                            Inventory
                        </TabsTrigger>
                        <TabsTrigger
                            value="shopping-list"
                            className="rounded-xl px-4 py-2 data-[state=active]:bg-[#AC4390]/10 data-[state=active]:text-[#AC4390] data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-[#AC4390]/30"
                        >
                            Shopping list
                        </TabsTrigger>
                        <TabsTrigger
                            value="usage-rules"
                            className="rounded-xl px-4 py-2 data-[state=active]:bg-[#AC4390]/10 data-[state=active]:text-[#AC4390] data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-[#AC4390]/30"
                        >
                            Usage rules
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="inventory" className="mt-0">
                        <InventoryCatalogueCard />
                    </TabsContent>
                    <TabsContent value="shopping-list" className="mt-0">
                        <InventoryShoppingListCard />
                    </TabsContent>
                    <TabsContent value="usage-rules" className="mt-0">
                        <InventoryUsageRulesCard />
                    </TabsContent>
                </Tabs>
                <InventoryDialogs />
            </div>
        </div>
    )
}
