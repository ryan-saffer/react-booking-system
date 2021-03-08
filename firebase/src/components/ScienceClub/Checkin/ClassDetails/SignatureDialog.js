import React, { useState } from 'react'

import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import SignatureCanvas from 'react-signature-canvas'
import { red } from '@material-ui/core/colors';

const SignatureDialog = props => {
    
    const classes = useStyles()

    var sigPad = {}

    const { pickupPeople } = props

    const [selectedGuardian, setSelectedGuardian] = useState('')
    const [guardianError, setGuardianError] = useState(false)
    const [signatureError, setSignatureError] = useState(false)
    const [disabled, setDisabled] = useState(false)
    
    const handleSignOut = () => {
        if (selectedGuardian === '') {
            setGuardianError(true)
        } else if (sigPad.isEmpty()) {
            setSignatureError(true)
        } else {
            setDisabled(true)
            setGuardianError(false)
            setSignatureError(false)
            props.onSignOut(
                selectedGuardian,
                sigPad.getTrimmedCanvas().toDataURL('image/png')
            )
        }
    }

    const handleSelectedGuardianChange = e => {
        setSelectedGuardian(e.target.value)
        setGuardianError(false)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth={"xl"}
            open={props.open}
            disableBackdropClick={true}
        >
            <DialogTitle className={classes.title}>Signature Required</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <DialogContentText className={classes.title}>Who is signing out the child?</DialogContentText>
                <FormControl className={classes.formControl} required error={guardianError}>
                <Select
                    id="parent-guardian-select"
                    value={selectedGuardian}
                    onChange={handleSelectedGuardianChange}
                    disabled={disabled}
                    variant="outlined"
                >
                    {pickupPeople.map(person => {
                        if (person.value !== '') {
                            return <MenuItem key={person.id} value={person.value}>{person.value}</MenuItem>
                        } else return null
                    })}
                </Select>
            </FormControl>
                <div className={classes.signatureCanvas}>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ height: 200, width: window.innerWidth * 0.75, style: { border: "1px dashed #000000" } }}
                        ref={(ref) => sigPad = ref}
                    />
                </div>
                {signatureError && <DialogContentText className={classes.error}>A signature is required to sign out of science club</DialogContentText>}
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button onClick={props.onClose} color="primary" disabled={disabled}>
                    Cancel
                </Button>
                <Button onClick={handleSignOut} color="secondary" disabled={disabled}>
                    Sign out
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const useStyles = makeStyles({
    signatureCanvas: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        width: 'fit-content',
    },
    title: {
        textAlign: 'center',
        marginBottom: 0,
        paddingBottom: 0
    },
    dialogContent: {
        paddingBottom: 0
    },
    formControl: {
        width: '100%',
        marginBottom: 8
    },
    error: {
        color: red[500],
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 0
    },
    dialogActions: {
        paddingTop: 0
    }
})

export default SignatureDialog