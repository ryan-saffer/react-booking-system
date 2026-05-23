import { describe, expect, it } from 'vitest'

import {
    getStockActionFormDefaultValues,
    getStockActionFormSchema,
    inventoryItemFormSchema,
    inventoryItemToFormValues,
    normalizeInventoryItemFormValues,
    normalizeStockActionFormValues,
    normalizeUsageRuleFormValues,
    usageRuleFormSchema,
    usageRuleToFormValues,
} from './inventory.form-schemas'

import type {
    ClientInventoryItem,
    ClientInventoryStockLevel,
    ClientInventoryUsageRule,
    StockAction,
} from './inventory.types'

const now = new Date('2026-05-01T00:00:00.000Z')

const quantityItem: ClientInventoryItem = {
    id: 'item-1',
    name: 'Party pies',
    inventoryKey: 'party-base:partyPies',
    category: 'party-food',
    status: 'active',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: 10,
    notes: 'Notes',
    createdAt: now,
    updatedAt: now,
}

const qualitativeItem: ClientInventoryItem = {
    id: 'item-2',
    name: 'Glitter',
    inventoryKey: 'custom-key',
    category: 'glitter',
    status: 'archived',
    $trackingMode: 'qualitative',
    createdAt: now,
    updatedAt: now,
}

const quantityStock: ClientInventoryStockLevel = {
    id: 'stock-1',
    itemId: 'item-1',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'quantity', quantity: 4 },
    updatedAt: now,
}

const qualitativeStock: ClientInventoryStockLevel = {
    id: 'stock-2',
    itemId: 'item-2',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'qualitative', level: 'medium' },
    updatedAt: now,
}

describe('inventory form schemas', () => {
    it('maps inventory items to form values and normalizes quantity inputs', () => {
        expect(inventoryItemToFormValues(quantityItem)).toEqual({
            name: 'Party pies',
            inventoryKeyType: 'party-base',
            inventoryKeyName: 'partyPies',
            category: 'party-food',
            $trackingMode: 'quantity',
            baseUnit: 'each',
            runningLowThreshold: '10',
            status: 'active',
            notes: 'Notes',
        })

        expect(
            normalizeInventoryItemFormValues({
                $trackingMode: 'quantity',
                name: 'Party pies',
                inventoryKeyType: 'party-base',
                inventoryKeyName: ' partyPies ',
                category: 'party-food',
                baseUnit: 'each',
                runningLowThreshold: '',
                status: 'active',
                notes: '',
            })
        ).toEqual({
            $trackingMode: 'quantity',
            name: 'Party pies',
            inventoryKeyType: 'party-base',
            inventoryKeyName: 'partyPies',
            inventoryKey: 'party-base:partyPies',
            category: 'party-food',
            baseUnit: 'each',
            runningLowThreshold: null,
            status: 'active',
            notes: '',
        })
    })

    it('maps qualitative items and clears empty inventory keys', () => {
        expect(inventoryItemToFormValues(qualitativeItem)).toMatchObject({
            inventoryKeyType: 'party-addition',
            inventoryKeyName: 'custom-key',
            baseUnit: 'each',
            runningLowThreshold: '',
        })

        expect(
            normalizeInventoryItemFormValues({
                $trackingMode: 'qualitative',
                name: 'Glitter',
                inventoryKeyType: 'party-base',
                inventoryKeyName: ' ',
                category: 'glitter',
                baseUnit: 'tub',
                runningLowThreshold: '999',
                status: 'active',
                notes: '',
            })
        ).toMatchObject({
            $trackingMode: 'qualitative',
            inventoryKeyName: '',
            inventoryKey: null,
            runningLowThreshold: null,
        })
    })

    it('adds custom inventory item threshold validation', () => {
        expect(
            inventoryItemFormSchema.safeParse({
                $trackingMode: 'quantity',
                name: 'Party pies',
                inventoryKeyType: 'party-base',
                inventoryKeyName: 'partyPies',
                category: 'party-food',
                baseUnit: 'each',
                runningLowThreshold: '-1',
                status: 'active',
                notes: '',
            }).success
        ).toBe(false)
        expect(
            inventoryItemFormSchema.safeParse({
                $trackingMode: 'quantity',
                name: 'Party pies',
                inventoryKeyType: 'party-base',
                inventoryKeyName: 'partyPies',
                category: 'party-food',
                baseUnit: 'each',
                runningLowThreshold: '',
                status: 'active',
                notes: '',
            }).success
        ).toBe(true)
    })

    it('maps and normalizes usage rule values for all operations', () => {
        const fixedRule: ClientInventoryUsageRule = {
            id: 'fixed',
            $type: 'party-base',
            inventoryKey: 'party-base:partyPies',
            label: 'Party pies',
            status: 'active',
            quantity: { $operation: 'fixed', quantity: 2 },
            createdAt: now,
            updatedAt: now,
        }
        const additionRule: ClientInventoryUsageRule = {
            id: 'addition',
            $type: 'party-addition',
            addition: 'chickenNuggets',
            inventoryKey: 'party-addition:chickenNuggets',
            status: 'active',
            quantity: { $operation: 'per-child', quantityPerChild: 1 },
            createdAt: now,
            updatedAt: now,
        }
        const perChildRule: ClientInventoryUsageRule = {
            id: 'per-child',
            $type: 'party-base',
            inventoryKey: 'unparsed-key',
            status: 'active',
            quantity: { $operation: 'per-child', quantityPerChild: 1 },
            createdAt: now,
            updatedAt: now,
        }
        const fixedPlusRule: ClientInventoryUsageRule = {
            id: 'fixed-plus',
            $type: 'party-food-package',
            inventoryKey: 'party-food-package:fairyBread',
            status: 'active',
            quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: 1, quantityPerChild: 0.5 },
            createdAt: now,
            updatedAt: now,
        }

        expect(usageRuleToFormValues(fixedRule)).toMatchObject({
            $type: 'party-base',
            name: 'partyPies',
            quantity: { $operation: 'fixed', quantity: '2' },
        })
        expect(usageRuleToFormValues(additionRule)).toMatchObject({
            $type: 'party-addition',
            name: 'chickenNuggets',
            quantity: { $operation: 'per-child', quantityPerChild: '1' },
        })
        expect(usageRuleToFormValues(perChildRule)).toMatchObject({
            name: 'unparsed-key',
            quantity: { $operation: 'per-child', quantityPerChild: '1' },
        })
        expect(usageRuleToFormValues(fixedPlusRule)).toMatchObject({
            name: 'fairyBread',
            quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: '1', quantityPerChild: '0.5' },
        })

        expect(
            normalizeUsageRuleFormValues({
                $type: 'party-base',
                name: ' partyPies ',
                label: 'Party pies',
                status: 'active',
                quantity: { $operation: 'fixed', quantity: '2' },
                notes: 'Order frozen',
            })
        ).toEqual({
            $type: 'party-base',
            name: 'partyPies',
            label: 'Party pies',
            status: 'active',
            quantity: { $operation: 'fixed', quantity: 2 },
            notes: 'Order frozen',
        })

        expect(
            normalizeUsageRuleFormValues({
                $type: 'party-addition',
                name: 'chickenNuggets',
                label: '',
                status: 'active',
                quantity: { $operation: 'per-child', quantityPerChild: '1' },
                notes: '',
            })
        ).toMatchObject({
            $type: 'party-addition',
            name: 'chickenNuggets',
            quantity: { $operation: 'per-child', quantityPerChild: 1 },
        })

        expect(
            normalizeUsageRuleFormValues({
                $type: 'party-food-package',
                name: ' fairyBread ',
                label: '',
                status: 'active',
                quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: '1', quantityPerChild: '0.5' },
                notes: '',
            })
        ).toEqual({
            $type: 'party-food-package',
            name: 'fairyBread',
            label: undefined,
            status: 'active',
            quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: 1, quantityPerChild: 0.5 },
            notes: undefined,
        })
    })

    it('adds custom usage rule numeric validation on top of zod shapes', () => {
        expect(
            usageRuleFormSchema.safeParse({
                $type: 'party-base',
                name: 'partyPies',
                label: '',
                status: 'active',
                quantity: { $operation: 'fixed', quantity: '0' },
                notes: '',
            }).success
        ).toBe(false)
        expect(
            usageRuleFormSchema.safeParse({
                $type: 'party-base',
                name: 'partyPies',
                label: '',
                status: 'active',
                quantity: { $operation: 'per-child', quantityPerChild: '0' },
                notes: '',
            }).success
        ).toBe(false)
        expect(
            usageRuleFormSchema.safeParse({
                $type: 'party-base',
                name: 'partyPies',
                label: '',
                status: 'active',
                quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: '0', quantityPerChild: '1' },
                notes: '',
            }).success
        ).toBe(true)
    })

    it('validates stock action quantities and normalizes payloads', () => {
        const receive: StockAction = { $type: 'receive', item: quantityItem, stock: quantityStock }
        const set: StockAction = { $type: 'set', item: quantityItem, stock: quantityStock }
        const level: StockAction = { $type: 'level', item: qualitativeItem, stock: qualitativeStock }

        expect(
            getStockActionFormSchema(receive).safeParse({ quantity: '0', level: 'unknown', reason: '' }).success
        ).toBe(false)
        expect(
            getStockActionFormSchema(receive).safeParse({ quantity: 'abc', level: 'unknown', reason: '' }).success
        ).toBe(false)
        expect(getStockActionFormSchema(set).safeParse({ quantity: '-1', level: 'unknown', reason: '' }).success).toBe(
            false
        )
        expect(getStockActionFormSchema(set).safeParse({ quantity: '4', level: 'unknown', reason: '' }).success).toBe(
            false
        )
        expect(getStockActionFormSchema(set).safeParse({ quantity: '5', level: 'unknown', reason: '' }).success).toBe(
            true
        )
        expect(getStockActionFormSchema(level).safeParse({ quantity: '', level: 'high', reason: '' }).success).toBe(
            true
        )
        expect(getStockActionFormDefaultValues(set)).toEqual({ quantity: '4', level: 'unknown', reason: '' })
        expect(getStockActionFormDefaultValues(level)).toEqual({ quantity: '', level: 'medium', reason: '' })
        expect(normalizeStockActionFormValues({ quantity: '3', level: 'low', reason: ' counted ' })).toEqual({
            quantity: 3,
            level: 'low',
            reason: ' counted ',
        })
    })
})
