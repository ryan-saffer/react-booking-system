import { useContext } from 'react'

import { ConfirmationDialogWithCheckboxContext } from './confirmation-dialog-with-checkbox-provider'

export function useConfirmWithCheckbox() {
    const context = useContext(ConfirmationDialogWithCheckboxContext)
    return context
}
