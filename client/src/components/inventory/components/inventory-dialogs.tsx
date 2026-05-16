import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui-components/dialog'

import { inventoryItemToFormValues } from '../form-schemas'
import { InventoryItemForm } from './inventory-item-form'
import { StockActionForm } from './stock-action-form'
import { useInventoryActions } from '../hooks/use-inventory-actions'
import { useInventoryLocation } from '../hooks/use-inventory-location'
import { useInventoryStore } from '../state/inventory-store'
import { getStockActionDescription, getStockActionTitle } from '../utils'

export function InventoryDialogs() {
    return (
        <>
            <EditInventoryItemDialog />
            <StockActionDialog />
        </>
    )
}

function EditInventoryItemDialog() {
    const actions = useInventoryActions()
    const item = useInventoryStore((state) => state.editingItem)
    const closeEditDialog = useInventoryStore((state) => state.closeEditDialog)

    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && closeEditDialog()}>
            <DialogContent className="twp max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit inventory item</DialogTitle>
                    <DialogDescription>Update this catalogue item across all locations.</DialogDescription>
                </DialogHeader>
                <InventoryItemForm
                    defaultValues={item ? inventoryItemToFormValues(item) : undefined}
                    isPending={actions.isUpdatingItem || actions.isDeletingItem}
                    submitLabel="Save changes"
                    item={item}
                    onDelete={actions.deleteItem}
                    onSubmit={actions.updateItem}
                />
            </DialogContent>
        </Dialog>
    )
}

function StockActionDialog() {
    const actions = useInventoryActions()
    const { location } = useInventoryLocation()
    const action = useInventoryStore((state) => state.stockAction)
    const closeStockActionDialog = useInventoryStore((state) => state.closeStockActionDialog)

    return (
        <Dialog open={!!action} onOpenChange={(open) => !open && closeStockActionDialog()}>
            <DialogContent className="twp max-w-xl">
                {action ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{getStockActionTitle(action)}</DialogTitle>
                            <DialogDescription>{getStockActionDescription(action, location)}</DialogDescription>
                        </DialogHeader>
                        <StockActionForm
                            action={action}
                            isPending={actions.isAdjustStockPending}
                            onSubmit={actions.adjustStock}
                        />
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
