import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    dialogContent: {
        whiteSpace: "pre-wrap"
    }
}))

/**
 * Higher-order-component that provides an error dialog to display a message.
 * Any consumer can simply call props.displayError(errorMessage).
 */
const withErrorDialog = Component => props => {

    const classes = useStyles()

    var [open, setOpen] = useState(false)
    var [errorMessage, setErrorMessage] = useState("")

    const displayError = message => {
        setErrorMessage(message)
        setOpen(true)
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
                <DialogTitle >{"Oops, something went wrong"}</DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.dialogContent}>{errorMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Okay
                    </Button>
                </DialogActions>
            </Dialog>
            <Component {...props} displayError={displayError} />
        </>
    )
}

export default withErrorDialog