import React, { useState } from 'react'

import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import SignatureCanvas from 'react-signature-canvas'
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles({
    signatureCanvas: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        width: 'fit-content',
    },
    heading: {
        marginBottom: 0
    },
    formControl: {
        minWidth: 165,
        marginBottom: 8
    },
    error: {
        color: red[500]
    }
})

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
            <DialogTitle>Signature</DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.heading}>Who is picking up the child?</DialogContentText>
                <FormControl className={classes.formControl} required error={guardianError}>
                <InputLabel>Parent/Guardian</InputLabel>
                <Select
                    id="parent-guardian-select"
                    value={selectedGuardian}
                    onChange={handleSelectedGuardianChange}
                    disabled={disabled}
                >
                    {pickupPeople.map(person => {
                        if (person.value !== '') {
                            return <MenuItem key={person.id} value={person.value}>{person.value}</MenuItem>
                        } else return null
                    })}
                </Select>
            </FormControl>
                <DialogContentText className={signatureError ? classes.error : null}>A signature is required to sign out of science club</DialogContentText>
                <div className={classes.signatureCanvas}>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ height: 200, width: 600, style: { border: "1px solid #000000" } }}
                        ref={(ref) => sigPad = ref}
                    />
                </div>
            </DialogContent>
            <DialogActions>
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

export default SignatureDialog