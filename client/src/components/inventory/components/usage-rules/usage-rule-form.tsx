import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useFormContext, useWatch } from 'react-hook-form'

import type { InventoryUsageRuleType } from 'fizz-kidz'

import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Textarea } from '@ui-components/textarea'

import { primaryButtonClass } from '../../utils/inventory.constants'
import {
    defaultUsageRuleFormValues,
    normalizeUsageRuleFormValues,
    usageRuleFormSchema,
} from '../../utils/inventory.form-schemas'
import {
    buildInventoryKeyFromParts,
    inventoryUsageRuleTypeOptions,
    partyAdditionOptions,
} from '../../utils/inventory.usage-rules'

import type { UsageRuleFormInput, UsageRuleFormValues } from '../../utils/inventory.form-schemas'
import type { ClientInventoryUsageRule } from '../../utils/inventory.types'
import type { FieldPath } from 'react-hook-form'

export function UsageRuleForm({
    defaultValues,
    isPending,
    onSubmit,
    onDelete,
    submitLabel,
    usageRule,
}: {
    defaultValues?: UsageRuleFormInput
    isPending: boolean
    onSubmit: (values: UsageRuleFormValues) => void
    onDelete?: () => void
    submitLabel: string
    usageRule?: ClientInventoryUsageRule | null
}) {
    const form = useForm<UsageRuleFormInput>({
        resolver: zodResolver(usageRuleFormSchema),
        defaultValues: defaultValues ?? defaultUsageRuleFormValues,
    })
    const ruleType = useWatch({ control: form.control, name: '$type' })
    const ruleName = useWatch({ control: form.control, name: 'name' })
    const quantityOperation = useWatch({ control: form.control, name: 'quantity.$operation' })
    const generatedKey = ruleName ? buildInventoryKeyFromParts(ruleType, ruleName) : ''

    useEffect(() => {
        form.reset(defaultValues ?? defaultUsageRuleFormValues)
    }, [defaultValues, form])

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((values) => onSubmit(normalizeUsageRuleFormValues(values)))}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="$type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rule type</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(value) => {
                                        const nextType = value as InventoryUsageRuleType
                                        field.onChange(nextType)
                                        if (nextType === 'party-addition') {
                                            form.setValue('name', 'chickenNuggets')
                                        } else {
                                            form.setValue('name', '')
                                        }
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Rule type" />
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
                                <p className="m-0 text-xs leading-relaxed text-slate-500">
                                    {
                                        inventoryUsageRuleTypeOptions.find((option) => option.value === ruleType)
                                            ?.description
                                    }
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <RuleNameField ruleType={ruleType} isPending={isPending} />
                </div>

                {generatedKey ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                        Generated key: <span className="font-mono font-semibold text-slate-950">{generatedKey}</span>
                    </div>
                ) : null}

                <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display label</FormLabel>
                            <FormControl>
                                <Input placeholder="Chicken nuggets" disabled={isPending} {...field} />
                            </FormControl>
                            <p className="m-0 text-xs leading-relaxed text-slate-500">
                                Optional. Leave blank to use the name or addition display label.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="quantity.$operation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity calculation</FormLabel>
                                <Select
                                    value={field.value}
                                    disabled={isPending}
                                    onValueChange={(value) => {
                                        if (value === 'fixed') {
                                            form.setValue('quantity', { $operation: 'fixed', quantity: '1' })
                                        } else if (value === 'per-child') {
                                            form.setValue('quantity', {
                                                $operation: 'per-child',
                                                quantityPerChild: '1',
                                            })
                                        } else {
                                            form.setValue('quantity', {
                                                $operation: 'fixed-plus-per-child',
                                                fixedQuantity: '0',
                                                quantityPerChild: '1',
                                            })
                                        }
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Quantity calculation" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed per booking</SelectItem>
                                        <SelectItem value="per-child">Per child</SelectItem>
                                        <SelectItem value="fixed-plus-per-child">Fixed + per child</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select value={field.value} disabled={isPending} onValueChange={field.onChange}>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <QuantityFields operation={quantityOperation} isPending={isPending} />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Optional rule notes." disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {onDelete && usageRule ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            disabled={isPending}
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete rule
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

function RuleNameField({ ruleType, isPending }: { ruleType: InventoryUsageRuleType; isPending: boolean }) {
    const form = useFormContext<UsageRuleFormInput>()

    if (ruleType === 'party-addition') {
        return (
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Addition</FormLabel>
                        <Select value={field.value} disabled={isPending} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Addition" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {partyAdditionOptions.map((option) => (
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
        )
    }

    return (
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="partyPies" disabled={isPending} {...field} />
                    </FormControl>
                    <p className="m-0 text-xs leading-relaxed text-slate-500">
                        This becomes the key suffix. Use something memorable like partyPies or fairyBread.
                    </p>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

function QuantityFields({
    operation,
    isPending,
}: {
    operation: UsageRuleFormInput['quantity']['$operation']
    isPending: boolean
}) {
    if (operation === 'fixed') {
        return <NumberField name="quantity.quantity" label="Amount per booking" isPending={isPending} />
    }

    if (operation === 'per-child') {
        return <NumberField name="quantity.quantityPerChild" label="Amount per child" isPending={isPending} />
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <NumberField name="quantity.fixedQuantity" label="Fixed amount per booking" isPending={isPending} />
            <NumberField name="quantity.quantityPerChild" label="Amount per child" isPending={isPending} />
        </div>
    )
}

type QuantityFieldName = 'quantity.quantity' | 'quantity.quantityPerChild' | 'quantity.fixedQuantity'

function NumberField({ name, label, isPending }: { name: QuantityFieldName; label: string; isPending: boolean }) {
    const form = useFormContext<UsageRuleFormInput>()

    return (
        <FormField
            control={form.control}
            name={name as FieldPath<UsageRuleFormInput>}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            inputMode="decimal"
                            placeholder="1"
                            disabled={isPending}
                            value={String(field.value ?? '')}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
