import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'

/**
 * Higher-order-component that provides a confirmation dialog.
 * Dialog title, message, confirmation button text and list items and confirm callback are all provided onShow()
 */
export interface ConfirmationDialogProps {
    showConfirmationDialog: (params: ShowDialogParams) => void
}

interface ShowDialogParams {
    dialogTitle: string
    dialogContent: string
    confirmationButtonText: string
    listItems?: ListItems
    conditionalTextField?: ConditionalTextField
    onConfirm: ConfirmationCallback
}

export interface ConfirmationResult {
    selectedListItem: string
    conditionalTextValue?: string
}

type ConfirmationCallback = (selectedListItem: string, confirmationResult?: string) => void

export interface ListItems {
    title: string
    items: Array<{ key: string; value: string }>
}

interface ConditionalTextField {
    triggerValue: string
    label: string
}

// see https://stackoverflow.com/a/51084259
const WithConfirmationDialog = <P extends ConfirmationDialogProps>(
    Component: React.ComponentType<P>
): React.FC<Omit<P, keyof ConfirmationDialogProps>> => {
    const ComponentWithConfirmationDialog = (props: Omit<P, keyof ConfirmationDialogProps>) => {
        const [open, setOpen] = useState(false)
        const [title, setTitle] = useState('')
        const [content, setContent] = useState('')
        const [listItems, setListItems] = useState<ListItems | null>(null)
        const [conditionalTextField, setConditionalTextField] = useState<ConditionalTextField | null>(null)
        const [formError, setFormError] = useState(false)
        const [selectedListItem, setSelectedListItem] = useState('')
        const [conditionalTextValue, setConditionalTextValue] = useState('')
        const [conditionalTextError, setConditionalTextError] = useState(false)
        const [confirmButton, setConfirmButton] = useState('')
        const [confirmCallback, setConfirmCallback] = useState<ConfirmationCallback>(() => {})

        const reset = () => {
            setListItems(null)
            setConditionalTextField(null)
            setSelectedListItem('')
            setConditionalTextValue('')
            setConditionalTextError(false)
            setFormError(false)
            setConfirmButton('')
            setConfirmCallback(() => {})
        }

        const handleShow = (params: ShowDialogParams) => {
            setTitle(params.dialogTitle)
            setContent(params.dialogContent)
            setConfirmButton(params.confirmationButtonText)
            setConfirmCallback(() => params.onConfirm)
            setSelectedListItem('')
            setConditionalTextValue('')
            setConditionalTextError(false)
            setFormError(false)
            setOpen(true)
            setListItems(params.listItems ?? null)
            setConditionalTextField(params.conditionalTextField ?? null)
        }

        const handleListItemChange = (event: SelectChangeEvent<string>) => {
            setSelectedListItem(event.target.value)
            setFormError(false)
            setConditionalTextValue('')
            setConditionalTextError(false)
        }

        const handleConditionalTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setConditionalTextValue(event.target.value)
            setConditionalTextError(false)
        }

        const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            const requiresConditionalText =
                conditionalTextField !== null && selectedListItem === conditionalTextField.triggerValue

            if (listItems && !selectedListItem) {
                setFormError(true)
            } else if (requiresConditionalText && !conditionalTextValue.trim()) {
                setConditionalTextError(true)
            } else {
                confirmCallback(selectedListItem, requiresConditionalText ? conditionalTextValue.trim() : undefined)
                setOpen(false)
                reset()
            }
        }

        const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            setOpen(false)
            reset()
        }

        return (
            <>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{content}</DialogContentText>
                        {listItems && (
                            <>
                                <FormControl className="mt-4 w-full" error={formError}>
                                    <InputLabel>{listItems.title}</InputLabel>
                                    <Select
                                        value={selectedListItem}
                                        onChange={handleListItemChange}
                                        label={listItems.title}
                                    >
                                        {listItems.items.map((item) => (
                                            <MenuItem key={item.key} value={item.key}>
                                                {item.value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {conditionalTextField && selectedListItem === conditionalTextField.triggerValue && (
                                    <TextField
                                        className="mt-4 w-full"
                                        multiline
                                        rows={2}
                                        label={conditionalTextField.label}
                                        value={conditionalTextValue}
                                        onChange={handleConditionalTextChange}
                                        error={conditionalTextError}
                                        helperText={conditionalTextError ? 'Please enter a reason.' : ''}
                                        size="small"
                                    />
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e) => handleConfirm(e)} color="secondary" variant="contained">
                            {confirmButton}
                        </Button>
                        <Button onClick={(e) => handleClose(e)} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Component {...(props as P)} showConfirmationDialog={handleShow} />
            </>
        )
    }

    return ComponentWithConfirmationDialog
}

export default WithConfirmationDialog
