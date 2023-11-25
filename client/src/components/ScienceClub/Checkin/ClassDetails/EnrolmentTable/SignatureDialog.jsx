import React, { useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

import { TextField } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { red } from '@mui/material/colors'
import { styled } from '@mui/material/styles';

const PREFIX = 'SignatureDialog';

const classes = {
    signatureCanvas: `${PREFIX}-signatureCanvas`,
    title: `${PREFIX}-title`,
    dialogContent: `${PREFIX}-dialogContent`,
    formControl: `${PREFIX}-formControl`,
    error: `${PREFIX}-error`,
    dialogActions: `${PREFIX}-dialogActions`
};

const StyledDialog = styled(Dialog)({
    [`& .${classes.signatureCanvas}`]: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        width: 'fit-content',
    },
    [`& .${classes.title}`]: {
        textAlign: 'center',
        marginBottom: 0,
        paddingBottom: 0,
    },
    [`& .${classes.dialogContent}`]: {
        paddingBottom: 0,
    },
    [`& .${classes.formControl}`]: {
        width: '100%',
        marginBottom: 8,
    },
    [`& .${classes.error}`]: {
        color: red[500],
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 0,
    },
    [`& .${classes.dialogActions}`]: {
        paddingTop: 0,
    },
});

const SignatureDialog = (props) => {


    var sigPad = {}

    const { pickupPeople } = props

    const [selectedGuardian, setSelectedGuardian] = useState('')
    const [guardianError, setGuardianError] = useState(false)
    const [signatureError, setSignatureError] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [showNameInput, setShowNameInput] = useState(false)
    const [staffName, setStaffName] = useState('')
    const [staffNameError, setStaffNameError] = useState(false)
    const [staffReason, setStaffReason] = useState('')
    const [staffReasonError, setStaffReasonError] = useState(false)

    const handleSignOut = async () => {
        const staffSignout = selectedGuardian === 'Fizz Kidz Staff'
        if (selectedGuardian === '') {
            setGuardianError(true)
        } else if (staffSignout && staffName === '') {
            setStaffNameError(true)
        } else if (staffSignout && staffReason === '') {
            setStaffReasonError(true)
        } else if (sigPad.isEmpty()) {
            setSignatureError(true)
        } else {
            setDisabled(true)
            setGuardianError(false)
            setSignatureError(false)
            setStaffNameError(false)
            setStaffReasonError(false)
            let person = selectedGuardian
            if (staffSignout) {
                person = `STAFF: ${staffName}`
            }
            await props.onSignOut(
                person,
                sigPad.getTrimmedCanvas().toDataURL('image/png'),
                staffSignout ? staffReason : ''
            )
            setSelectedGuardian('')
            setStaffName('')
            setStaffReason('')
            setDisabled(false)
        }
    }

    const handleSelectedGuardianChange = (e) => {
        e.stopPropagation()
        setSelectedGuardian(e.target.value)
        if (e.target.value === 'Fizz Kidz Staff') {
            setShowNameInput(true)
        } else {
            setShowNameInput(false)
        }
        setGuardianError(false)
    }

    return (
        <StyledDialog onClick={(e) => e.stopPropagation()} fullWidth={true} maxWidth={'xl'} open={props.open}>
            <DialogTitle className={classes.title}>Initial Required</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <DialogContentText className={classes.title}>Who is signing out the child?</DialogContentText>
                <FormControl className={classes.formControl} error={guardianError}>
                    <Select
                        id="parent-guardian-select"
                        value={selectedGuardian}
                        onChange={handleSelectedGuardianChange}
                        disabled={disabled}
                        variant="outlined"
                    >
                        {pickupPeople.map((person) => (
                            <MenuItem key={person} value={person}>
                                {person}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {showNameInput && (
                    <>
                        <FormControl className={classes.formControl}>
                            <TextField
                                error={staffNameError}
                                label={staffNameError && 'Staff Name Required'}
                                variant="outlined"
                                value={staffName}
                                placeholder="Enter staff name"
                                onChange={(e) => {
                                    setStaffNameError(false)
                                    setStaffName(e.target.value)
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                error={staffReasonError}
                                label={staffReasonError && 'Please explain why a staff is signing this child out'}
                                variant="outlined"
                                value={staffReason}
                                placeholder="Enter reason that the staff is signing this child out"
                                onChange={(e) => {
                                    setStaffReason(false)
                                    setStaffReason(e.target.value)
                                }}
                            />
                        </FormControl>
                    </>
                )}
                <div className={classes.signatureCanvas}>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{
                            height: 200,
                            width: window.innerWidth * 0.75,
                            style: { border: '1px dashed #000000' },
                        }}
                        ref={(ref) => (sigPad = ref)}
                    />
                </div>
                {signatureError && (
                    <DialogContentText className={classes.error}>
                        An initial is required to sign out of science club
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button onClick={props.onClose} color="primary" disabled={disabled}>
                    Cancel
                </Button>
                <Button onClick={handleSignOut} color="secondary" disabled={disabled}>
                    Sign out
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}

export default SignatureDialog
