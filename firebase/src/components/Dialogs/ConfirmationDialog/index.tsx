import React, { ChangeEvent, FormEvent, useState } from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    deleteButton: {
        color: 'red'
    },
    form: {
        width: '100%'
    }
}))

/**
 * Higher-order-component that provides a confirmation dialog.
 * Dialog title, message, confirmation button text and list items and confirm callback are all provided onShow()
 */

export interface ConfirmationDialogProps {
    showConfirmationDialog: (params: ShowDialogParams) => void
}

interface ShowDialogParams {
    dialogTitle: string,
    dialogContent: string,
    confirmationButtonText: string,
    listItems?: ListItems,
    onConfirm: ConfirmationCallback
}

type ConfirmationCallback = (selectedListItem: string) => void

export interface ListItems {
    title: string,
    items: Array<{ key: string, value: string}>
}

const WithConfirmationDialog = <P extends ConfirmationDialogProps>(Component: React.ComponentType<P>) => {
    
    const ComponentWithConfirmationDialog = (props: P) => {
        
        const classes = useStyles()

        const [open, setOpen] = useState(false)
        const [title, setTitle] = useState('')
        const [content, setContent] = useState('')
        const [listItems, setListItems] = useState<ListItems | null>(null)
        const [formError, setFormError] = useState(false)
        const [selectedListItem, setSelectedListItem] = useState('')
        const [confirmButton, setConfirmButton] = useState('')
        const [confirmCallback, setConfirmCallback] = useState<ConfirmationCallback>(() => {})

        const handleShow = (params: ShowDialogParams) => {
            setTitle(params.dialogTitle)
            setContent(params.dialogContent)
            setConfirmButton(params.confirmationButtonText)
            setConfirmCallback(() => params.onConfirm)
            setOpen(true)
            params.listItems && setListItems(params.listItems)
        }

        const handleListItemChange = (event: ChangeEvent<{ value: unknown }>) => {
            setSelectedListItem(event.target.value as string)
            setFormError(false)
        }

        const handleConfirm = () => {
            if (listItems && !selectedListItem) {
                setFormError(true)
            } else {
                confirmCallback(selectedListItem) // if listItems not provided, selectedListItem will be null here - but thats okay
                setOpen(false)
            }
        }

        const handleClose = () => {
            setOpen(false)
        }

        return (
            <>
                <Dialog
                    open={open}
                    onClose={handleClose}
                >
                    <DialogTitle >{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{content}</DialogContentText>
                        {listItems && 
                                <FormControl className={classes.form} error={formError}>
                                    <InputLabel>{listItems.title}</InputLabel>
                                    <Select value={selectedListItem} onChange={handleListItemChange}>
                                        {listItems.items.map(item => <MenuItem key={item.key} value={item.key}>{item.value}</MenuItem>)}
                                    </Select>
                                </FormControl>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirm} classes={{ root: classes.deleteButton }}>
                            {confirmButton}
                        </Button>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Component { ...props } showConfirmationDialog={handleShow} />
            </>
        )
    }

    return ComponentWithConfirmationDialog
}

export default WithConfirmationDialog