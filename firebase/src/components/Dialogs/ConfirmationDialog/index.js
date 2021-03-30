import React, { useState } from 'react'
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
 * Dialog title, message, confirmation button text, and confirm callback are all provided onShow()
 */
const withConfirmationDialog = Component => props => {
    
    const classes = useStyles()

    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [listItems, setListItems] = useState(null)
    const [formError, setFormError] = useState(false)
    const [selectedListItem, setSelectedListItem] = useState('')
    const [confirmButton, setConfirmButton] = useState('')
    const [confirmCallback, setConfirmCallback] = useState(null)

    const handleShow = ({ title, message, confirmButton, onConfirm, listItems }) => {
        setTitle(title)
        setContent(message)
        setConfirmButton(confirmButton)
        setConfirmCallback(() => onConfirm)
        setOpen(true)
        listItems && setListItems(listItems)
    }

    const handleListItemChange = event => {
        setSelectedListItem(event.target.value)
        setFormError(false)
    }

    const handleConfirm = () => {
        if (listItems && !selectedListItem) {
            setFormError(true)
        } else {
            if (listItems) {
                confirmCallback(selectedListItem)
            } else {
                confirmCallback()
            }
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

export default withConfirmationDialog