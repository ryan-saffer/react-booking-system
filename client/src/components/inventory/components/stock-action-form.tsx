import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { INVENTORY_QUALITATIVE_STOCK_LEVELS } from 'fizz-kidz'
import type { InventoryQualitativeStockLevel } from 'fizz-kidz'

import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Textarea } from '@ui-components/textarea'

import { primaryButtonClass } from '../constants'
import {
    getStockActionFormDefaultValues,
    getStockActionFormSchema,
    normalizeStockActionFormValues,
} from '../form-schemas'
import { formatQualitativeLevel, getCurrentQuantity, getStockActionSubmitLabel } from '../utils'

import type { StockActionFormInput, StockActionFormValues } from '../form-schemas'
import type { StockAction } from '../types'

export function StockActionForm({
    action,
    isPending,
    onSubmit,
}: {
    action: StockAction
    isPending: boolean
    onSubmit: (values: StockActionFormValues) => void
}) {
    const form = useForm<StockActionFormInput>({
        resolver: zodResolver(getStockActionFormSchema(action)),
        defaultValues: getStockActionFormDefaultValues(action),
    })
    const currentQuantity = getCurrentQuantity(action.stock)
    const hasUnknownQuantity =
        action.stock?.measurement.$type === 'quantity' && action.stock.measurement.quantity === null

    useEffect(() => {
        form.reset(getStockActionFormDefaultValues(action))
    }, [action, form])

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((values) => onSubmit(normalizeStockActionFormValues(values)))}
            >
                {action.$type === 'level' ? (
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock level</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(level) => field.onChange(level as InventoryQualitativeStockLevel)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {INVENTORY_QUALITATIVE_STOCK_LEVELS.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {formatQualitativeLevel(level)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {action.$type === 'receive' ? 'Quantity received' : 'Actual stock count'}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        inputMode="decimal"
                                        disabled={isPending}
                                        placeholder={
                                            action.$type === 'receive'
                                                ? '12'
                                                : currentQuantity === null
                                                  ? 'Count needed'
                                                  : String(currentQuantity)
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                {action.$type === 'set' ? (
                                    <p className="m-0 text-xs leading-relaxed text-slate-500">
                                        {hasUnknownQuantity
                                            ? 'Current recorded stock is unknown. Saving will set the counted amount.'
                                            : `Current recorded stock is ${currentQuantity}. Saving will set the counted amount.`}
                                    </p>
                                ) : null}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={isPending}
                                    placeholder={
                                        action.$type === 'receive'
                                            ? 'Optional supplier, order, or delivery notes.'
                                            : 'Optional stocktake or correction notes.'
                                    }
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className={primaryButtonClass} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {getStockActionSubmitLabel(action)}
                </Button>
            </form>
        </Form>
    )
}
