import { useContext } from 'react'

import { ConfirmationDialogContext } from './confirmation-dialog-provider'

export function useConfirm() {
    const ConfirmDialogContext = useContext(ConfirmationDialogContext)
    return ConfirmDialogContext
}
