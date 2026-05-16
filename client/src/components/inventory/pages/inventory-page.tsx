import { InventoryCatalogueCard } from '../components/inventory-catalogue-card'
import { InventoryDialogs } from '../components/inventory-dialogs'
import { InventoryPageHeader } from '../components/inventory-page-header'
import { useInventoryData } from '../hooks/use-inventory-data'

export function InventoryPage() {
    const { itemCount, trackedStockCount } = useInventoryData()

    return (
        <div className="twp min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#effcff] via-[#f7fbff] to-[#eef5ff] px-4 py-6 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <InventoryPageHeader itemCount={itemCount} trackedCount={trackedStockCount} />
                <InventoryCatalogueCard />
                <InventoryDialogs />
            </div>
        </div>
    )
}
