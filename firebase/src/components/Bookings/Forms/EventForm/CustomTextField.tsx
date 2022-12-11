import { TextField, TextFieldProps } from '@material-ui/core'
import React, { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { FormFields } from './FormFields'

type Props = {
    field: keyof FormFields
    label: string
    details: FormFields[keyof FormFields]
} & TextFieldProps

const CustomTextField: React.FC<Props> = ({ field, label, details, ...rest }) => {
    return (
        <TextField
            id={field}
            name={field}
            label={label}
            fullWidth
            variant="outlined"
            autoComplete="off"
            value={details.value}
            error={details.error}
            helperText={details.error ? details.errorText : ''}
            {...rest}
        />
    )
}

export default CustomTextField
