import { z } from 'zod'

import { INVENTORY_CATEGORIES, INVENTORY_QUALITATIVE_STOCK_LEVELS, INVENTORY_UNITS } from 'fizz-kidz'
import type { InventoryCategory, InventoryQualitativeStockLevel, InventoryUnit } from 'fizz-kidz'

import { getCurrentQualitativeLevel, getCurrentQuantity } from './utils'

import type { ClientInventoryItem, StockAction } from './types'

const requiredNameSchema = z.string().trim().min(1, { message: 'Item name is required.' })
const runningLowThresholdSchema = z
    .string()
    .trim()
    .superRefine((value, ctx) => {
        if (!value) return

        const threshold = Number(value)
        if (!Number.isFinite(threshold) || threshold < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Running low threshold must be zero or greater.' })
        }
    })

export const inventoryItemFormSchema = z.discriminatedUnion('$trackingMode', [
    z.object({
        $trackingMode: z.literal('quantity'),
        name: requiredNameSchema,
        category: z.enum(INVENTORY_CATEGORIES),
        baseUnit: z.enum(INVENTORY_UNITS),
        runningLowThreshold: runningLowThresholdSchema,
        status: z.enum(['active', 'archived']),
        notes: z.string().trim(),
    }),
    z.object({
        $trackingMode: z.literal('qualitative'),
        name: requiredNameSchema,
        category: z.enum(INVENTORY_CATEGORIES),
        baseUnit: z.enum(INVENTORY_UNITS),
        runningLowThreshold: z.string(),
        status: z.enum(['active', 'archived']),
        notes: z.string().trim(),
    }),
])

export type InventoryItemFormInput = z.infer<typeof inventoryItemFormSchema>
export type InventoryItemFormValues =
    | {
          $trackingMode: 'quantity'
          name: string
          category: InventoryCategory
          baseUnit: InventoryUnit
          runningLowThreshold: number | null
          status: 'active' | 'archived'
          notes: string
      }
    | {
          $trackingMode: 'qualitative'
          name: string
          category: InventoryCategory
          baseUnit: InventoryUnit
          runningLowThreshold: null
          status: 'active' | 'archived'
          notes: string
      }

export const defaultInventoryItemFormValues: InventoryItemFormInput = {
    name: '',
    category: 'party-food',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: '',
    status: 'active',
    notes: '',
}

export function inventoryItemToFormValues(item: ClientInventoryItem): InventoryItemFormInput {
    return {
        name: item.name,
        category: item.category,
        $trackingMode: item.$trackingMode,
        baseUnit: item.baseUnit ?? 'each',
        runningLowThreshold:
            item.$trackingMode === 'quantity' && item.runningLowThreshold !== null
                ? String(item.runningLowThreshold)
                : '',
        status: item.status,
        notes: item.notes ?? '',
    }
}

export function normalizeInventoryItemFormValues(values: InventoryItemFormInput): InventoryItemFormValues {
    if (values.$trackingMode === 'quantity') {
        return {
            ...values,
            runningLowThreshold: values.runningLowThreshold ? Number(values.runningLowThreshold) : null,
        }
    }

    return { ...values, runningLowThreshold: null }
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
