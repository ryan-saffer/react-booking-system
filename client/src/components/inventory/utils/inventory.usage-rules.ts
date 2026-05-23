import { ADDITIONS, getInventoryUsageRuleInventoryKey, parseInventoryUsageRuleInventoryKey } from 'fizz-kidz'
import type { Addition, InventoryUsageRuleType } from 'fizz-kidz'

export const inventoryUsageRuleTypeOptions: { value: InventoryUsageRuleType; label: string; description: string }[] = [
    {
        value: 'party-addition',
        label: 'Party addition',
        description: 'Only when this paid addition is selected.',
    },
    {
        value: 'party-food-package',
        label: 'Food package',
        description: 'Only when the booking includes the standard food package.',
    },
    {
        value: 'party-base',
        label: 'Every party',
        description: 'Every studio party in the selected date range.',
    },
]

export const partyAdditionOptions = Object.entries(ADDITIONS).map(([value, addition]) => ({
    value: value as Addition,
    label: addition.displayValue,
}))

export function buildInventoryKeyFromParts(type: InventoryUsageRuleType, name: string) {
    return getInventoryUsageRuleInventoryKey(type, name)
}

export function parseInventoryKeyParts(inventoryKey: string | undefined) {
    return parseInventoryUsageRuleInventoryKey(inventoryKey)
}

export function getUsageRuleTypeLabel(type: InventoryUsageRuleType) {
    return inventoryUsageRuleTypeOptions.find((option) => option.value === type)?.label ?? type
}

export function getUsageRuleNameLabel(type: InventoryUsageRuleType, name: string) {
    if (type === 'party-addition') {
        return ADDITIONS[name as Addition]?.displayValue ?? name
    }

    return name
}
