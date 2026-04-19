import * as rhf from 'react-hook-form'

import type {
    DeepPartial,
    UseFieldArrayProps,
    UseFieldArrayReturn,
    FieldValues,
    FieldArrayPath,
    FieldArrayMethodProps,
    FieldArray,
} from 'react-hook-form'

export const SimpleTextRule = {
    pattern: /^[a-zA-Z0-9 -]+$/,
    message: 'No special characters allowed.',
}

export const PhoneRule = {
    pattern: /^[0-9]+$/,
    message: 'Only numbers 0-9 allowed',
}

/**
 * Same as `useFieldArray`, but the append methods allows partial values just like the default values for a form does.
 * See {@link https://github.com/orgs/react-hook-form/discussions/10211#discussioncomment-13437503}
 */
export function usePartialFieldArray<
    TFieldValues extends FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>(
    props: UseFieldArrayProps<TFieldValues, TFieldArrayName>
): Omit<UseFieldArrayReturn<TFieldValues, TFieldArrayName>, 'append'> & {
    append: (value: DeepPartial<FieldArray<TFieldValues, TFieldArrayName>>, options?: FieldArrayMethodProps) => void
} {
    const { append, ...rest } = rhf.useFieldArray(props)
    function appendPartial(
        value: DeepPartial<FieldArray<TFieldValues, TFieldArrayName>>,
        options?: FieldArrayMethodProps
    ): void {
        append(value as FieldArray<TFieldValues, TFieldArrayName>, options)
    }
    return { ...rest, append: appendPartial }
}
