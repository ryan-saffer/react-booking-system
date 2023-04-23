import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        whiteSpace: 'pre-wrap',
    },
}))

/**
 * Higher-order-component that provides an error dialog to display a message.
 * Any consumer can simply call props.displayError(errorMessage).
 */
export interface ErrorDialogProps {
    displayError: (mesage: string) => void
}

const WithErrorDialog = <P extends ErrorDialogProps>(
    Component: React.ComponentType<P>
): React.FC<Omit<P, keyof ErrorDialogProps>> => {
    const ComponentWithErrorDialog = (props: Omit<P, keyof ErrorDialogProps>) => {
        const classes = useStyles()

        var [open, setOpen] = useState(false)
        var [errorMessage, setErrorMessage] = useState('')

        const displayError = (message: string) => {
            setErrorMessage(message)
            setOpen(true)
        }

        const handleClose = () => {
            setOpen(false)
        }

        return (
            <>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{'Something went wrong'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText className={classes.dialogContent}>{errorMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Okay
                        </Button>
                    </DialogActions>
                </Dialog>
                <Component {...(props as P)} displayError={displayError} />
            </>
        )
    }

    return ComponentWithErrorDialog
}

export default WithErrorDialog
