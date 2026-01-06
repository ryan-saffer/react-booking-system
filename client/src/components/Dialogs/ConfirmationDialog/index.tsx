import React, { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

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
    onConfirm: ConfirmationCallback
}

type ConfirmationCallback = (selectedListItem: string) => void

export interface ListItems {
    title: string
    items: Array<{ key: string; value: string }>
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
        const [formError, setFormError] = useState(false)
        const [selectedListItem, setSelectedListItem] = useState('')
        const [confirmButton, setConfirmButton] = useState('')
        const [confirmCallback, setConfirmCallback] = useState<ConfirmationCallback>(() => {})

        const reset = () => {
            setListItems(null)
            setSelectedListItem('')
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
            setFormError(false)
            setOpen(true)
            setListItems(params.listItems ?? null)
        }

        const handleListItemChange = (event: SelectChangeEvent<string>) => {
            setSelectedListItem(event.target.value)
            setFormError(false)
        }

        const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            if (listItems && !selectedListItem) {
                setFormError(true)
            } else {
                confirmCallback(selectedListItem) // if listItems not provided, selectedListItem will be null here - but thats okay
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
