import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    deleteButton: {
        color: 'red'
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
    const [confirmButton, setConfirmButton] = useState('')
    const [confirmCallback, setConfirmCallback] = useState(null)

    const handleShow = ({ title, message, confirmButton, onConfirm }) => {
        setTitle(title)
        setContent(message)
        setConfirmButton(confirmButton)
        setConfirmCallback(() => onConfirm)
        setOpen(true)
    }

    const handleConfirm = () => {
        confirmCallback()
        setOpen(false)
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