import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'

const PREFIX = 'WithConfirmationDialog'

const classes = {
    deleteButton: `${PREFIX}-deleteButton`,
    form: `${PREFIX}-form`,
}

const Root = styled('div')({
    [`& .${classes.deleteButton}`]: {
        color: 'red',
    },

    [`& .${classes.form}`]: {
        width: '100%',
    },
})

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

        useEffect(() => {
            // reset form when closing
            if (!open) {
                reset()
            }
        }, [open])

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
            setOpen(true)
            params.listItems && setListItems(params.listItems)
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
            }
        }

        const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            setOpen(false)
        }

        return (
            <Root>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{content}</DialogContentText>
                        {listItems && (
                            <FormControl className={classes.form} error={formError}>
                                <InputLabel>{listItems.title}</InputLabel>
                                <Select value={selectedListItem} onChange={handleListItemChange}>
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
                        <Button onClick={(e) => handleConfirm(e)} color="error" variant="contained">
                            {confirmButton}
                        </Button>
                        <Button onClick={(e) => handleClose(e)} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Component {...(props as P)} showConfirmationDialog={handleShow} />
            </Root>
        )
    }

    return ComponentWithConfirmationDialog
}

export default WithConfirmationDialog
