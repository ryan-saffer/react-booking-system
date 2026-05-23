import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from 'fizz-kidz'
import type { InventoryCategory, InventoryItem, InventoryUnit, InventoryUsageRuleType } from 'fizz-kidz'

import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Textarea } from '@ui-components/textarea'

import { primaryButtonClass } from '../../utils/inventory.constants'
import {
    defaultInventoryItemFormValues,
    inventoryItemFormSchema,
    normalizeInventoryItemFormValues,
} from '../../utils/inventory.form-schemas'
import { inventoryUsageRuleTypeOptions } from '../../utils/inventory.usage-rules'
import { formatCategory, formatUnit } from '../../utils/inventory.utils'

import type { InventoryItemFormInput, InventoryItemFormValues } from '../../utils/inventory.form-schemas'
import type { ClientInventoryItem, TrackingMode } from '../../utils/inventory.types'

export function InventoryItemForm({
    defaultValues,
    isPending,
    onSubmit,
    onDelete,
    submitLabel,
    item,
}: {
    defaultValues?: InventoryItemFormInput
    isPending: boolean
    onSubmit: (values: InventoryItemFormValues) => void
    onDelete?: () => void
    submitLabel: string
    item?: ClientInventoryItem | null
}) {
    const form = useForm<InventoryItemFormInput>({
        resolver: zodResolver(inventoryItemFormSchema),
        defaultValues: defaultValues ?? defaultInventoryItemFormValues,
    })
    const trackingMode = useWatch({ control: form.control, name: '$trackingMode' })

    useEffect(() => {
        form.reset(defaultValues ?? defaultInventoryItemFormValues)
    }, [defaultValues, form])

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((values) => onSubmit(normalizeInventoryItemFormValues(values)))}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item name</FormLabel>
                            <FormControl>
                                <Input placeholder="Party pies" disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 sm:grid-cols-[220px,1fr]">
                    <FormField
                        control={form.control}
                        name="inventoryKeyType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shopping-list type</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(type) => field.onChange(type as InventoryUsageRuleType)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {inventoryUsageRuleTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="inventoryKeyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shopping-list name</FormLabel>
                                <FormControl>
                                    <Input placeholder="chickenNuggets" disabled={isPending} {...field} />
                                </FormControl>
                                <p className="m-0 text-xs leading-relaxed text-slate-500">
                                    Optional. Use the same type and name on a usage rule to include this item in
                                    generated shopping lists.
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(category) => field.onChange(category as InventoryCategory)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {INVENTORY_CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {formatCategory(category)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="$trackingMode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tracking</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={($trackingMode) => field.onChange($trackingMode as TrackingMode)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tracking" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="quantity">Exact quantity</SelectItem>
                                        <SelectItem value="qualitative">High / medium / low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="baseUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Base unit</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(baseUnit) => field.onChange(baseUnit as InventoryUnit)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {INVENTORY_UNITS.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {formatUnit(unit)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="m-0 text-xs leading-relaxed text-slate-500">
                                    Exact items count this unit. Qualitative items use it as a helpful reference only.
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {trackingMode === 'quantity' ? (
                        <FormField
                            control={form.control}
                            name="runningLowThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Running low threshold</FormLabel>
                                    <FormControl>
                                        <Input inputMode="decimal" placeholder="20" disabled={isPending} {...field} />
                                    </FormControl>
                                    <p className="m-0 text-xs leading-relaxed text-slate-500">
                                        Show a red running-low badge when stock is at or below this count. Leave blank
                                        to disable.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(status) => field.onChange(status as InventoryItem['status'])}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="m-0 text-xs leading-relaxed text-slate-500">
                                    Archive items instead of deleting them once they have history.
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Supplier, storage notes, or counting guidance."
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {onDelete && item ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            disabled={isPending}
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete item
                        </Button>
                    ) : (
                        <span />
                    )}
                    <Button type="submit" className={primaryButtonClass} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
