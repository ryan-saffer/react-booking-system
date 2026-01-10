import { createContext } from 'react'
import type { Props, Result } from './confirmation-dialog-with-checkbox.provider'

export const ConfirmationDialogWithCheckboxContext = createContext<(props: Props) => Promise<Result>>(
    () => new Promise((resolve) => resolve({ confirmed: false, checked: false }))
)
