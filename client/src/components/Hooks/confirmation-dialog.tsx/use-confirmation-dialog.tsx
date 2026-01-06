import { useContext } from 'react'
import { ConfirmationDialogContext } from './confirmation-dialog.context'

export function useConfirm() {
    const ConfirmDialogContext = useContext(ConfirmationDialogContext)
    return ConfirmDialogContext
}
