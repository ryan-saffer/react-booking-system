import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import SignatureCanvas from 'react-signature-canvas'

const useStyles = makeStyles({
    signatureCanvas: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        width: 'fit-content',
    }
})

const SignatureDialog = props => {
    
    const classes = useStyles()

    var sigPad = {}
    
    const handleSignOut = () => {
        props.onSignOut(
            sigPad.getTrimmedCanvas().toDataURL('image/png')
        )
    }

    return (

        <Dialog
            fullWidth={true}
            maxWidth={"xl"}
            open={props.open}
            disableBackdropClick={true}
        >
            <DialogTitle>Signature</DialogTitle>
            <DialogContent>
                <DialogContentText>A parent or guardian signature is required to sign out of science club</DialogContentText>
                <div className={classes.signatureCanvas}>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ height: 200, width: 600, style: { border: "1px solid #000000" } }}
                        ref={(ref) => sigPad = ref}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSignOut} color="secondary">
                    Sign out
                </Button>
            </DialogActions>
        </Dialog>


    )
}

export default SignatureDialog