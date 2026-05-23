import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui-components/dialog'

import { useInventoryActions } from '../../hooks/use-inventory-actions'
import { useInventoryLocation } from '../../hooks/use-inventory-location'
import { useInventoryStore } from '../../state/inventory-store'
import { inventoryItemToFormValues, usageRuleToFormValues } from '../../utils/inventory.form-schemas'
import { getStockActionDescription, getStockActionTitle } from '../../utils/inventory.utils'
import { InventoryItemForm } from '../inventory/inventory-item-form'
import { StockActionForm } from '../inventory/stock-action-form'
import { UsageRuleForm } from '../usage-rules/usage-rule-form'

export function InventoryDialogs() {
    return (
        <>
            <EditInventoryItemDialog />
            <EditUsageRuleDialog />
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

function EditUsageRuleDialog() {
    const actions = useInventoryActions()
    const usageRule = useInventoryStore((state) => state.editingUsageRule)
    const closeEditUsageRuleDialog = useInventoryStore((state) => state.closeEditUsageRuleDialog)

    return (
        <Dialog open={!!usageRule} onOpenChange={(open) => !open && closeEditUsageRuleDialog()}>
            <DialogContent className="twp max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit usage rule</DialogTitle>
                    <DialogDescription>Update how this item appears in generated shopping lists.</DialogDescription>
                </DialogHeader>
                <UsageRuleForm
                    defaultValues={usageRule ? usageRuleToFormValues(usageRule) : undefined}
                    isPending={actions.isUpdatingUsageRule || actions.isDeletingUsageRule}
                    submitLabel="Save rule"
                    usageRule={usageRule}
                    onDelete={actions.deleteUsageRule}
                    onSubmit={actions.updateUsageRule}
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
