import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

/**
 * Higher-order-component that provides a confirmation dialog.
 * Dialog title, content, confirmation button text, and confirm callback must be provided on showConfirmationDialog()
 */

export type ConfirmationDialogProps = {
    showConfirmationDialog: (params: ShowDialogParams) => void
}

type ShowDialogParams = {
    dialogTitle: string,
    dialogContent: string,
    confirmationButtonText: string,
    onConfirm: ConfirmationCallback
}

type ConfirmationCallback = () => void

const WithConfirmationDialog = <P extends ConfirmationDialogProps>(Component: React.ComponentType<P>) => {
        
    const ComponentWithConfirmationDialog = (props: P) => {
        
        const [open, setOpen] = useState(false)
        const [title, setTitle] = useState('')
        const [content, setContent] = useState('')
        const [confirmationButtonText, setConfirmationButtonText] = useState('')
        const [onConfirm, setOnConfirm] = useState<ConfirmationCallback>(() => {})

        const handleShow = (params: ShowDialogParams) => {
            setTitle(params.dialogTitle)
            setContent(params.dialogContent)
            setConfirmationButtonText(params.confirmationButtonText)
            setOnConfirm(() => params.onConfirm)
            setOpen(true)
        }

        const handleConfirm = () => {
            onConfirm()
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
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{content}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirm} color="primary">
                            {confirmationButtonText}
                        </Button>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                    </Button>
                    </DialogActions>
                </Dialog>
                <Component {...props} showConfirmationDialog={handleShow} />
            </>
        )
    }

    return ComponentWithConfirmationDialog
}

export default WithConfirmationDialog