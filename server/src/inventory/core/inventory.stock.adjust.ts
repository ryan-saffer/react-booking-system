import { z } from 'zod'

import type { InventoryStockLevel, InventoryStockMovement } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import {
    inventoryStockAdjustmentInputSchema,
    inventoryStockMovementSourceSchema,
    studioSchema,
} from './inventory.schemas'

export const adjustInventoryStockInputSchema = z.object({
    itemId: z.string().min(1),
    location: studioSchema,
    stocked: z.boolean().optional(),
    adjustment: inventoryStockAdjustmentInputSchema,
    source: inventoryStockMovementSourceSchema,
    reason: z.string().optional(),
})

export type AdjustInventoryStockInput = z.infer<typeof adjustInventoryStockInputSchema>

type InventoryStockMovementActor = {
    uid: string
    email: string
}

export async function adjustInventoryStock(input: AdjustInventoryStockInput, actor: InventoryStockMovementActor) {
    return DatabaseClient.runInventoryStockMovementTransaction({
        itemId: input.itemId,
        location: input.location,
        buildWrite: ({ item, stockLevel, stockLevelId, movementId, now }) => {
            if (item.$trackingMode !== input.adjustment.$type) {
                throw new Error(
                    `Inventory item '${input.itemId}' uses '${item.$trackingMode}' tracking and cannot receive a '${input.adjustment.$type}' adjustment`
                )
            }

            if (input.adjustment.$type === 'quantity') {
                const currentMeasurement = stockLevel?.measurement ?? ({ $type: 'quantity', quantity: null } as const)
                if (currentMeasurement.$type !== 'quantity') {
                    throw new Error(`Inventory stock level '${stockLevelId}' does not use quantity tracking`)
                }

                if (input.adjustment.$operation === 'adjust') {
                    const quantityBefore = currentMeasurement.quantity
                    if (quantityBefore == null) {
                        throw new Error(
                            `Inventory stock level '${stockLevelId}' has an unknown quantity; set a count first`
                        )
                    }

                    const quantityAfter = quantityBefore + input.adjustment.delta

                    if (quantityAfter < 0) {
                        throw new Error(`Inventory stock level '${stockLevelId}' cannot be reduced below zero`)
                    }

                    const nextStockLevel: InventoryStockLevel = {
                        ...(stockLevel ?? {}),
                        id: stockLevelId,
                        itemId: input.itemId,
                        location: input.location,
                        stocked: input.stocked ?? stockLevel?.stocked ?? true,
                        measurement: {
                            $type: 'quantity',
                            quantity: quantityAfter,
                        },
                        lastMovementAt: now,
                        updatedAt: now,
                    }
                    const movement: InventoryStockMovement = {
                        id: movementId,
                        itemId: input.itemId,
                        location: input.location,
                        source: input.source,
                        adjustment: {
                            $type: 'quantity',
                            $operation: 'adjust',
                            delta: input.adjustment.delta,
                            quantityBefore,
                            quantityAfter,
                        },
                        reason: input.reason,
                        createdAt: now,
                        createdBy: actor,
                    }

                    return { stockLevel: nextStockLevel, movement }
                }

                const quantityBefore = currentMeasurement.quantity
                const quantityAfter = input.adjustment.quantity

                const nextStockLevel: InventoryStockLevel = {
                    ...(stockLevel ?? {}),
                    id: stockLevelId,
                    itemId: input.itemId,
                    location: input.location,
                    stocked: input.stocked ?? stockLevel?.stocked ?? true,
                    measurement: {
                        $type: 'quantity',
                        quantity: quantityAfter,
                    },
                    lastMovementAt: now,
                    updatedAt: now,
                }
                const movement: InventoryStockMovement = {
                    id: movementId,
                    itemId: input.itemId,
                    location: input.location,
                    source: input.source,
                    adjustment: {
                        $type: 'quantity',
                        $operation: 'set',
                        quantityBefore,
                        quantityAfter,
                    },
                    reason: input.reason,
                    createdAt: now,
                    createdBy: actor,
                }

                return { stockLevel: nextStockLevel, movement }
            }

            const currentMeasurement = stockLevel?.measurement ?? ({ $type: 'qualitative', level: 'unknown' } as const)
            if (currentMeasurement.$type !== 'qualitative') {
                throw new Error(`Inventory stock level '${stockLevelId}' does not use qualitative tracking`)
            }

            const nextStockLevel: InventoryStockLevel = {
                ...(stockLevel ?? {}),
                id: stockLevelId,
                itemId: input.itemId,
                location: input.location,
                stocked: input.stocked ?? stockLevel?.stocked ?? true,
                measurement: {
                    $type: 'qualitative',
                    level: input.adjustment.level,
                },
                lastMovementAt: now,
                updatedAt: now,
            }
            const movement: InventoryStockMovement = {
                id: movementId,
                itemId: input.itemId,
                location: input.location,
                source: input.source,
                adjustment: {
                    $type: 'qualitative',
                    levelBefore: currentMeasurement.level,
                    levelAfter: input.adjustment.level,
                },
                reason: input.reason,
                createdAt: now,
                createdBy: actor,
            }

            return { stockLevel: nextStockLevel, movement }
        },
    })
}
