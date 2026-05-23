import { z } from 'zod'

import {
    INVENTORY_CATEGORIES,
    INVENTORY_QUALITATIVE_STOCK_LEVELS,
    INVENTORY_UNITS,
    INVENTORY_USAGE_RULE_TYPES,
} from 'fizz-kidz'
import type {
    Addition,
    InventoryCategory,
    InventoryQualitativeStockLevel,
    InventoryUnit,
    InventoryUsageRule,
    InventoryUsageRuleType,
} from 'fizz-kidz'

import { buildInventoryKeyFromParts, parseInventoryKeyParts } from './inventory.usage-rules'
import { getCurrentQualitativeLevel, getCurrentQuantity } from './inventory.utils'

import type { ClientInventoryItem, StockAction } from './inventory.types'

const requiredNameSchema = z.string().trim().min(1, { message: 'Item name is required.' })
const optionalInventoryKeyNameSchema = z.string().trim()
const optionalNonNegativeQuantitySchema = (label: string) =>
    z
        .string()
        .trim()
        .superRefine((value, ctx) => {
            if (!value) return

            const quantity = Number(value)
            if (!Number.isFinite(quantity) || quantity < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be zero or greater.` })
            }
        })

export const inventoryItemFormSchema = z.discriminatedUnion('$trackingMode', [
    z.object({
        $trackingMode: z.literal('quantity'),
        name: requiredNameSchema,
        inventoryKeyType: z.enum(INVENTORY_USAGE_RULE_TYPES),
        inventoryKeyName: optionalInventoryKeyNameSchema,
        category: z.enum(INVENTORY_CATEGORIES),
        baseUnit: z.enum(INVENTORY_UNITS),
        runningLowThreshold: optionalNonNegativeQuantitySchema('Running low threshold'),
        minimumTargetQuantity: optionalNonNegativeQuantitySchema('Keep at least'),
        status: z.enum(['active', 'archived']),
        notes: z.string().trim(),
    }),
    z.object({
        $trackingMode: z.literal('qualitative'),
        name: requiredNameSchema,
        inventoryKeyType: z.enum(INVENTORY_USAGE_RULE_TYPES),
        inventoryKeyName: optionalInventoryKeyNameSchema,
        category: z.enum(INVENTORY_CATEGORIES),
        baseUnit: z.enum(INVENTORY_UNITS),
        runningLowThreshold: z.string(),
        minimumTargetQuantity: z.string(),
        status: z.enum(['active', 'archived']),
        notes: z.string().trim(),
    }),
])

export type InventoryItemFormInput = z.infer<typeof inventoryItemFormSchema>
export type InventoryItemFormValues =
    | {
          $trackingMode: 'quantity'
          name: string
          inventoryKeyType: InventoryUsageRuleType
          inventoryKeyName: string
          inventoryKey: string | null
          category: InventoryCategory
          baseUnit: InventoryUnit
          runningLowThreshold: number | null
          minimumTargetQuantity: number | null
          status: 'active' | 'archived'
          notes: string
      }
    | {
          $trackingMode: 'qualitative'
          name: string
          inventoryKeyType: InventoryUsageRuleType
          inventoryKeyName: string
          inventoryKey: string | null
          category: InventoryCategory
          baseUnit: InventoryUnit
          runningLowThreshold: null
          minimumTargetQuantity: null
          status: 'active' | 'archived'
          notes: string
      }

export const defaultInventoryItemFormValues: InventoryItemFormInput = {
    name: '',
    inventoryKeyType: 'party-addition',
    inventoryKeyName: '',
    category: 'party-food',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: '',
    minimumTargetQuantity: '',
    status: 'active',
    notes: '',
}

export function inventoryItemToFormValues(item: ClientInventoryItem): InventoryItemFormInput {
    const inventoryKeyParts = parseInventoryKeyParts(item.inventoryKey)

    return {
        name: item.name,
        inventoryKeyType: inventoryKeyParts?.$type ?? 'party-addition',
        inventoryKeyName: inventoryKeyParts?.name ?? item.inventoryKey ?? '',
        category: item.category,
        $trackingMode: item.$trackingMode,
        baseUnit: item.baseUnit ?? 'each',
        runningLowThreshold:
            item.$trackingMode === 'quantity' && item.runningLowThreshold !== null
                ? String(item.runningLowThreshold)
                : '',
        minimumTargetQuantity:
            item.$trackingMode === 'quantity' && item.minimumTargetQuantity != null
                ? String(item.minimumTargetQuantity)
                : '',
        status: item.status,
        notes: item.notes ?? '',
    }
}

export function normalizeInventoryItemFormValues(values: InventoryItemFormInput): InventoryItemFormValues {
    const inventoryKeyName = values.inventoryKeyName.trim()
    const inventoryKey = inventoryKeyName ? buildInventoryKeyFromParts(values.inventoryKeyType, inventoryKeyName) : null

    if (values.$trackingMode === 'quantity') {
        return {
            ...values,
            inventoryKeyName,
            inventoryKey,
            runningLowThreshold: values.runningLowThreshold ? Number(values.runningLowThreshold) : null,
            minimumTargetQuantity: values.minimumTargetQuantity ? Number(values.minimumTargetQuantity) : null,
        }
    }

    return { ...values, inventoryKeyName, inventoryKey, runningLowThreshold: null, minimumTargetQuantity: null }
}

export const usageRuleQuantityFormSchema = z.discriminatedUnion('$operation', [
    z.object({
        $operation: z.literal('fixed'),
        quantity: z.string().trim().min(1, { message: 'Quantity is required.' }),
    }),
    z.object({
        $operation: z.literal('per-child'),
        quantityPerChild: z.string().trim().min(1, { message: 'Per-child quantity is required.' }),
    }),
    z.object({
        $operation: z.literal('fixed-plus-per-child'),
        fixedQuantity: z.string().trim().min(1, { message: 'Fixed quantity is required.' }),
        quantityPerChild: z.string().trim().min(1, { message: 'Per-child quantity is required.' }),
    }),
])

export const usageRuleFormSchema = z
    .object({
        $type: z.enum(INVENTORY_USAGE_RULE_TYPES),
        name: z.string().trim().min(1, { message: 'Name is required.' }),
        label: z.string().trim(),
        status: z.enum(['active', 'archived']),
        quantity: usageRuleQuantityFormSchema,
        notes: z.string().trim(),
    })
    .superRefine((values, ctx) => {
        const numericFields = getUsageRuleQuantityNumericFields(values.quantity)
        numericFields.forEach(({ path, value }) => {
            const quantity = Number(value)
            const minimum = path === 'fixedQuantity' ? 0 : 1
            if (!Number.isFinite(quantity) || quantity < minimum) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['quantity', path],
                    message:
                        minimum === 0 ? 'Quantity must be zero or greater.' : 'Quantity must be greater than zero.',
                })
            }
        })
    })

export type UsageRuleFormInput = z.infer<typeof usageRuleFormSchema>
export type UsageRuleFormValues =
    | {
          $type: 'party-base'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed'; quantity: number }
          notes: string | undefined
      }
    | {
          $type: 'party-base'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'per-child'; quantityPerChild: number }
          notes: string | undefined
      }
    | {
          $type: 'party-base'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed-plus-per-child'; fixedQuantity: number; quantityPerChild: number }
          notes: string | undefined
      }
    | {
          $type: 'party-food-package'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed'; quantity: number }
          notes: string | undefined
      }
    | {
          $type: 'party-food-package'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'per-child'; quantityPerChild: number }
          notes: string | undefined
      }
    | {
          $type: 'party-food-package'
          name: string
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed-plus-per-child'; fixedQuantity: number; quantityPerChild: number }
          notes: string | undefined
      }
    | {
          $type: 'party-addition'
          name: Addition
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed'; quantity: number }
          notes: string | undefined
      }
    | {
          $type: 'party-addition'
          name: Addition
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'per-child'; quantityPerChild: number }
          notes: string | undefined
      }
    | {
          $type: 'party-addition'
          name: Addition
          label: string | undefined
          status: 'active' | 'archived'
          quantity: { $operation: 'fixed-plus-per-child'; fixedQuantity: number; quantityPerChild: number }
          notes: string | undefined
      }

export const defaultUsageRuleFormValues: UsageRuleFormInput = {
    $type: 'party-addition',
    name: 'chickenNuggets',
    label: '',
    status: 'active',
    quantity: {
        $operation: 'fixed',
        quantity: '1',
    },
    notes: '',
}

type UsageRuleFormSource = InventoryUsageRule extends infer Rule
    ? Rule extends unknown
        ? Omit<Rule, 'createdAt' | 'updatedAt'>
        : never
    : never

export function usageRuleToFormValues(rule: UsageRuleFormSource): UsageRuleFormInput {
    const parsedKey = parseInventoryKeyParts(rule.inventoryKey)

    return {
        $type: rule.$type,
        name: rule.$type === 'party-addition' ? rule.addition : (parsedKey?.name ?? rule.inventoryKey),
        label: rule.label ?? '',
        status: rule.status,
        quantity: usageRuleQuantityToFormValues(rule.quantity),
        notes: rule.notes ?? '',
    }
}

export function normalizeUsageRuleFormValues(values: UsageRuleFormInput): UsageRuleFormValues {
    const common = {
        name: values.name.trim(),
        label: values.label || undefined,
        status: values.status,
        quantity: normalizeUsageRuleQuantity(values.quantity),
        notes: values.notes || undefined,
    }

    if (values.$type === 'party-addition') {
        return { ...common, $type: values.$type, name: values.name as Addition } as UsageRuleFormValues
    }

    return { ...common, $type: values.$type } as UsageRuleFormValues
}

function usageRuleQuantityToFormValues(ruleQuantity: InventoryUsageRule['quantity']): UsageRuleFormInput['quantity'] {
    switch (ruleQuantity.$operation) {
        case 'fixed':
            return { $operation: 'fixed', quantity: String(ruleQuantity.quantity) }
        case 'per-child':
            return { $operation: 'per-child', quantityPerChild: String(ruleQuantity.quantityPerChild) }
        case 'fixed-plus-per-child':
            return {
                $operation: 'fixed-plus-per-child',
                fixedQuantity: String(ruleQuantity.fixedQuantity),
                quantityPerChild: String(ruleQuantity.quantityPerChild),
            }
    }
}

function normalizeUsageRuleQuantity(quantity: UsageRuleFormInput['quantity']): UsageRuleFormValues['quantity'] {
    switch (quantity.$operation) {
        case 'fixed':
            return { $operation: 'fixed', quantity: Number(quantity.quantity) }
        case 'per-child':
            return { $operation: 'per-child', quantityPerChild: Number(quantity.quantityPerChild) }
        case 'fixed-plus-per-child':
            return {
                $operation: 'fixed-plus-per-child',
                fixedQuantity: Number(quantity.fixedQuantity),
                quantityPerChild: Number(quantity.quantityPerChild),
            }
    }
}

function getUsageRuleQuantityNumericFields(quantity: UsageRuleFormInput['quantity']) {
    switch (quantity.$operation) {
        case 'fixed':
            return [{ path: 'quantity', value: quantity.quantity }]
        case 'per-child':
            return [{ path: 'quantityPerChild', value: quantity.quantityPerChild }]
        case 'fixed-plus-per-child':
            return [
                { path: 'fixedQuantity', value: quantity.fixedQuantity },
                { path: 'quantityPerChild', value: quantity.quantityPerChild },
            ]
    }
}

export const stockActionFormSchema = z.object({
    quantity: z.string().trim(),
    level: z.enum(INVENTORY_QUALITATIVE_STOCK_LEVELS),
    reason: z.string().trim(),
})

export type StockActionFormInput = z.infer<typeof stockActionFormSchema>
export type StockActionFormValues = {
    quantity: number
    level: InventoryQualitativeStockLevel
    reason: string
}

export function getStockActionFormSchema(action: StockAction) {
    const currentQuantity = getCurrentQuantity(action.stock)

    return stockActionFormSchema.superRefine((values, ctx) => {
        if (action.$type === 'level') return

        const quantity = Number(values.quantity)
        if (!Number.isFinite(quantity)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity'], message: 'Stock amount must be a number.' })
            return
        }

        if (action.$type === 'receive' && quantity <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['quantity'],
                message: 'Received stock must be greater than zero.',
            })
            return
        }

        if (action.$type === 'set') {
            if (quantity < 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['quantity'],
                    message: 'Stock count cannot be negative.',
                })
                return
            }

            if (currentQuantity === quantity) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['quantity'],
                    message: 'Stock already matches this amount.',
                })
            }
        }
    })
}

export function getStockActionFormDefaultValues(action: StockAction): StockActionFormInput {
    const currentQuantity = getCurrentQuantity(action.stock)

    return {
        quantity: action.$type === 'set' && currentQuantity !== null ? String(currentQuantity) : '',
        level: getCurrentQualitativeLevel(action.stock),
        reason: '',
    }
}

export function normalizeStockActionFormValues(values: StockActionFormInput): StockActionFormValues {
    return {
        quantity: Number(values.quantity),
        level: values.level,
        reason: values.reason,
    }
}
