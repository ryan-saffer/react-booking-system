import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
const PREFIX = 'WithErrorDialog'

const classes = {
    dialogContent: `${PREFIX}-dialogContent`,
}

const Root = styled('div')({
    [`& .${classes.dialogContent}`]: {
        whiteSpace: 'pre-wrap',
    },
})

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
        const [open, setOpen] = useState(false)
        const [errorMessage, setErrorMessage] = useState('')

        const displayError = (message: string) => {
            setErrorMessage(message)
            setOpen(true)
        }

        const handleClose = () => {
            setOpen(false)
        }

        return (
            <Root>
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
            </Root>
        )
    }

    return ComponentWithErrorDialog
}

export default WithErrorDialog
