import React, { useState, useEffect } from 'react'

import { withFirebase } from '../../Firebase'
import * as acuity from '../../../constants/acuity'
import * as bannedPhotoIcon from '../../../drawables/banned-camera-icon-24.png'
import * as medicalIcon from '../../../drawables/medical-icon-24.png'
import * as insulinIcon from '../../../drawables/insulin-icon-24.png'
import * as checkedInIcon from '../../../drawables/tick-box-green-icon-26.png'
import * as checkedOutIcon from '../../../drawables/tick-box-red-icon-26.png'
import * as uncheckedIcon from '../../../drawables/unchecked-icon-26.png'

import { makeStyles } from '@material-ui/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import SignatureDialog from './SignatureDialog';

const useStyles = makeStyles(theme => ({
    panelSummary: {
        display: 'flex',
        alignItems: 'stretch',
        width: '100%'
    },
    panelSummaryDetails: {
        flexBasis: '70%',
        display: 'flex',
        alignItems: 'center'
    },
    childInfo: {
        flexBasis: "20%",
        flexShrink: 0
    },
    chipCheckedIn: {
        marginLeft: 4,
        marginRight: 4,
        backgroundColor: green[500]
    },
    chipCheckedOut: {
        marginLeft: 4,
        marginRight: 4,
        backgroundColor: red[500]
    },
    icon: {
        height: 16,
        width: 16,
        margin: 4
    },
    panelSummaryButtonDiv: {
        flexBasis: '30%',
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        direction: 'rtl'
    },
    panelSummaryButton: {
        width: 'max-content',
        minWidth: 82
    },
    column: {
        flexBasis: '50.00%',
        display: 'flex',
        flexDirection: 'column'
    },
    heading: {
        marginTop: 8
    },
    loading: {
        marginRight: theme.spacing(1)
    },
    error: {
        color: red[500],
        display: 'flex',
        flexDirection: 'column'
    },
    signature: {
        width: 'fit-content'
    }
}))

const ChildExpansionPanel = props => {

    const classes = useStyles()

    const { firebase, expanded } = props

    const [client, setClient] = useState(props.client)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [signature, setSignature] = useState(null)
    const [key, setKey] = useState(0)

    const notSignedIn = client.labels == null
    const isSignedIn = client.labels != null && client.labels[0].id === acuity.LABELS.CHECKED_IN
    const isSignedOut = client.labels != null && client.labels[0].id === acuity.LABELS.CHECKED_OUT

    useEffect(() => {
        fetchSignature()
    }, [])

    const childDetailsForm = client.forms.find(
        form => form.id === acuity.FORMS.CHILD_DETAILS
    )
    const anaphylaxisForm = client.forms.find(
        form => form.id === acuity.FORMS.ANAPHYLAXIS
    )
    const emergencyContactForm = client.forms.find(
        form => form.id === acuity.FORMS.EMERGENCY_CONTACT
    )
    const pickupPeople = client.forms.find(
        form => form.id === acuity.FORMS.PICKUP_PERMISSION
    ).values
    const childName = childDetailsForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILD_NAME
    ).value
    const hasAllergies = childDetailsForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILD_ALLERGIES_YES_NO
    ).value === "yes"
    const isAnaphylactic = anaphylaxisForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILD_ANAPHYLACTIC
    ).value === "yes"
    const permissionToPhotograph = childDetailsForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILD_PHOTOGRAPHY_PERMISSON
    ).value === acuity.FORM_FIELDS_OPTIONS.CHILD_PHOTOGRAPHY_PERMISSION_YES

    const fetchSignature = () => {
        firebase.db.collection('scienceClubAppointments').doc(`${client.id}`).get()
            .then(documentSnapshot => {
                const sig = documentSnapshot.get('signature')
                const signedBy = documentSnapshot.get('pickupPerson')
                const timeStamp = documentSnapshot.get('timeStamp')
                console.log(sig, signedBy, timeStamp)
                setSignature({sig, signedBy, timeStamp: timeStamp.toDate()})
            })
            .catch(err => {
                console.log(`Error getting signature: ${err}`)
            })
    }

    const handleSignInButtonClick = e => {
        e.stopPropagation()
        setLoading(true)

        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: 'updateLabel', clientId: client.id, label: acuity.LABELS.CHECKED_IN }
        }).then(result => {
            console.log(result)
            setClient(result.data)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    const handleSignOutButtonClick = e => {
        e.stopPropagation()
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleSignOut = (pickupPerson, dataUrl) => {
        console.log(`DATA URL: ${dataUrl}`)

        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: 'updateLabel', clientId: client.id, label: acuity.LABELS.CHECKED_OUT }
        }).then(functionsResult => {
            console.log(functionsResult)
            firebase.db.doc(`scienceClubAppointments/${client.id}/`).set({
                pickupPerson: pickupPerson,
                signature: dataUrl,
                timeStamp: new Date()
            }).then(firestoreResult => {
                console.log(`Firestore result: ${firestoreResult}`)
                setClient(functionsResult.data)
                setSignature({sig: dataUrl, signedBy: pickupPerson, timeStamp: new Date()})
                setLoading(false)
                setOpen(false)
                setKey(key => key + 1)
            })
        }).catch(err => {
            console.err(err)
            setLoading(false)
        })
    }

    return (
        <>
        <ExpansionPanel
            key={client.id}
            expanded={expanded === client.id}
            onChange={props.onClientSelectionChange(client.id)}
        >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.panelSummary}>
                    <div className={classes.panelSummaryDetails}>
                        {notSignedIn && <img className={classes.icon} src={uncheckedIcon.default} alt="unchecked icon"/>}
                        {isSignedIn && <img className={classes.icon} src={checkedInIcon.default} alt="checked in icon"/>}
                        {isSignedOut && <img className={classes.icon} src={checkedOutIcon.default} alt="checked out icon"/>}
                        <Typography variant="button" className={classes.childInfo}>{childName}</Typography>
                        {hasAllergies && <img className={classes.icon} src={medicalIcon.default} alt="medical icon"/>}
                        {isAnaphylactic && <img className={classes.icon} src={insulinIcon.default} alt="insulin icon" />}
                        {!permissionToPhotograph && <img className={classes.icon} src={bannedPhotoIcon.default} alt="banned camera icon"/>}
                    </div>
                    <div className={classes.panelSummaryButtonDiv}>
                        {isSignedIn
                            ? <Button className={classes.panelSummaryButton} size="small" variant="contained" color="secondary" disabled={loading} onClick={handleSignOutButtonClick}>Sign out</Button>
                            : <Button className={classes.panelSummaryButton} size="small" variant="contained" color="primary" disabled={loading} onClick={handleSignInButtonClick}>Sign In</Button>
                        }
                        {loading && <CircularProgress className={classes.loading} size={24} />}
                    </div>
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className={classes.column}>
                    <Typography className={classes.heading} variant="button">Parent name:</Typography>
                    <Typography variant="body1">{client.firstName} {client.lastName}</Typography>
                    <Typography className={classes.heading} variant="button">Parent mobile:</Typography>
                    <Typography vairant="body1">{client.phone}</Typography>
                    <Typography className={classes.heading} variant="button">Parent email:</Typography>
                    <Typography variant="body1">{client.email}</Typography>
                    <Typography className={classes.heading} variant="button">Emergency Contact:</Typography>
                    <Typography variant="body1">
                        {emergencyContactForm.values.find(field => field.fieldID === acuity.FORM_FIELDS.EMERGENCY_CONTACT_NAME).value} - {emergencyContactForm.values.find(field => field.fieldID === acuity.FORM_FIELDS.EMERGENCY_CONTACT_RELATION).value}
                    </Typography>
                    <Typography variant="body1">{emergencyContactForm.values.find(field => field.fieldID === acuity.FORM_FIELDS.EMERGENCY_CONTACT_NUMBER).value}</Typography>
                </div>
                <div className={classes.column}>
                    <Typography className={classes.heading} variant="button">Child year level:</Typography>
                    <Typography variant="body1">{childDetailsForm.values.find(field => field.fieldID === acuity.FORM_FIELDS.CHILD_GRADE).value}</Typography>
                    {hasAllergies && (
                        <div className={classes.error}>
                            <>
                            <Typography className={classes.heading} variant="button">Allergies: {isAnaphylactic && "(ANAPHYLACTIC)"}</Typography>
                            <Typography variant="body1">{childDetailsForm.values.find(field => field.fieldID === acuity.FORM_FIELDS.CHILD_ALLERGIES).value}</Typography>
                            </>
                        </div> 
                    )}
                        <Typography className={classes.heading} variant="button">People allowed to pick child up:</Typography>
                        {pickupPeople.map(person => (
                            person.value !== null && <Typography key={person.id} variant="body1">{person.value}</Typography>
                        ))}
                    {signature && signature.sig && (
                        <>
                            <Typography className={classes.heading} variant="button">Signature:</Typography>
                            <img className={classes.signature} src={signature.sig} alt="signature"/>
                            <Typography variant="body1">{signature.signedBy}: {signature.timeStamp.toLocaleTimeString()}</Typography>
                        </>
                    )}
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        <SignatureDialog
            key={key}
            pickupPeople={pickupPeople}
            open={open}
            onClose={handleCloseDialog}
            onSignOut={handleSignOut}
        />
        </>    
    )
}

export default withFirebase(ChildExpansionPanel)