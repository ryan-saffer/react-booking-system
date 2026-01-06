import { createContext } from 'react'
import type { Props } from './confirmation-dialog.provider'

export const ConfirmationDialogContext = createContext<(props: Props) => Promise<boolean>>(
    () => new Promise((resolve) => resolve(false))
)
