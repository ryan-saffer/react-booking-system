import { useContext } from 'react'

import { ConfirmationDialogWithCheckboxContext } from './confirmation-dialog-with-checkbox.context'

export function useConfirmWithCheckbox() {
    const context = useContext(ConfirmationDialogWithCheckboxContext)
    return context
}
