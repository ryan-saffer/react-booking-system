import React, { useState } from 'react'

import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import SignatureCanvas from 'react-signature-canvas'
import { red } from '@material-ui/core/colors'
import { Input, TextField } from '@material-ui/core'

const SignatureDialog = (props) => {
    const classes = useStyles()

    var sigPad = {}

    const { pickupPeople } = props

    const [selectedGuardian, setSelectedGuardian] = useState('')
    const [guardianError, setGuardianError] = useState(false)
    const [signatureError, setSignatureError] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [showNameInput, setShowNameInput] = useState(false)
    const [staffName, setStaffName] = useState('')
    const [staffNameError, setStaffNameError] = useState(false)

    const handleSignOut = () => {
        if (selectedGuardian === '') {
            setGuardianError(true)
        } else if (selectedGuardian === 'Fizz Kidz Staff' && staffName === '') {
            setStaffNameError(true)
        } else if (sigPad.isEmpty()) {
            setSignatureError(true)
        } else {
            setDisabled(true)
            setGuardianError(false)
            setSignatureError(false)
            let person = selectedGuardian
            if (selectedGuardian === 'Fizz Kidz Staff') {
                person = `STAFF: ${staffName}`
            }
            props.onSignOut(person, sigPad.getTrimmedCanvas().toDataURL('image/png'))
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
        <Dialog
            onClick={(e) => e.stopPropagation()}
            fullWidth={true}
            maxWidth={'xl'}
            open={props.open}
            disableBackdropClick={true}
        >
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
        paddingBottom: 0,
    },
    dialogContent: {
        paddingBottom: 0,
    },
    formControl: {
        width: '100%',
        marginBottom: 8,
    },
    error: {
        color: red[500],
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 0,
    },
    dialogActions: {
        paddingTop: 0,
    },
})

export default SignatureDialog
