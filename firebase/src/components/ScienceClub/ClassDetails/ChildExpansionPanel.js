import React, { useState, useEffect } from 'react'

import { withFirebase } from '../../Firebase'
import * as acuity from '../../../constants/acuity'
import * as Utilities from '../../../utilities'
import * as bannedPhotoIcon from '../../../drawables/banned-camera-icon-24.png'
import * as medicalIcon from '../../../drawables/medical-icon-24.png'
import * as insulinIcon from '../../../drawables/insulin-icon-24.png'
import * as checkedInIcon from '../../../drawables/tick-box-green-icon-26.png'
import * as checkedOutIcon from '../../../drawables/tick-box-red-icon-26.png'
import * as uncheckedIcon from '../../../drawables/unchecked-icon-26.png'

import { makeStyles } from '@material-ui/styles'
import Accordion from '@material-ui/core/Accordion';
import AccordianDetails from '@material-ui/core/AccordionDetails';
import AccordianSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Button, TableContainer, Table, TableRow, TableCell, List, ListItem, TableBody } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import SignatureDialog from './SignatureDialog';

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
        const fetchSignature = () => {
            firebase.db.collection('scienceClubAppointments').doc(`${client.id}`).get()
                .then(documentSnapshot => {
                    const sig = documentSnapshot.get('signature')
                    const signedBy = documentSnapshot.get('pickupPerson')
                    const timeStamp = documentSnapshot.get('timeStamp')
                    setSignature({sig, signedBy, timeStamp: timeStamp.toDate()})
                })
                .catch(err => {
                    console.log(`Error getting signature: ${err}`)
                })
        
        }

        fetchSignature()

    }, [firebase.db, client.id])

    const childDetailsForm = Utilities.retrieveForm(client, acuity.FORMS.CHILD_DETAILS)
    const anaphylaxisForm = Utilities.retrieveForm(client, acuity.FORMS.ANAPHYLAXIS)
    const emergencyContactForm = Utilities.retrieveForm(client, acuity.FORMS.EMERGENCY_CONTACT)
    const pickupPeople = Utilities.retrieveForm(client, acuity.FORMS.PICKUP_PERMISSION)
    const mergedPickupPeople = [{id: client.id, value: `${client.firstName} ${client.lastName}`}, ...pickupPeople]
    const childName = Utilities.retrieveFormField(childDetailsForm, acuity.FORM_FIELDS.CHILD_NAME)
    const hasAllergies = Utilities.retrieveFormField(childDetailsForm, acuity.FORM_FIELDS.CHILD_ALLERGIES_YES_NO) === "yes"
    const isAnaphylactic = Utilities.retrieveFormField(anaphylaxisForm, acuity.FORM_FIELDS.CHILD_ANAPHYLACTIC_YES_BLANK) === "yes"
    const permissionToPhotograph = Utilities.retrieveFormField(childDetailsForm, acuity.FORM_FIELDS.CHILD_PHOTOGRAPHY_PERMISSON) === acuity.FORM_FIELDS_OPTIONS.CHILD_PHOTOGRAPHY_PERMISSION_YES

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
        <Accordion
            key={client.id}
            expanded={expanded === client.id}
            onChange={props.onClientSelectionChange(client.id)}
        >
            <AccordianSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.panelSummary}>
                    <div className={classes.panelSummaryDetails}>
                        {notSignedIn && <img className={classes.signInStatusIcon} src={uncheckedIcon.default} alt="unchecked icon"/>}
                        {isSignedIn && <img className={classes.signInStatusIcon} src={checkedInIcon.default} alt="checked in icon"/>}
                        {isSignedOut && <img className={classes.signInStatusIcon} src={checkedOutIcon.default} alt="checked out icon"/>}
                        <Typography className={classes.childName} variant="button">{childName}</Typography>
                        {hasAllergies && <img className={classes.icon} src={medicalIcon.default} alt="medical icon"/>}
                        {isAnaphylactic && <img className={classes.icon} src={insulinIcon.default} alt="insulin icon" />}
                        {!permissionToPhotograph && <img className={classes.icon} src={bannedPhotoIcon.default} alt="banned camera icon"/>}
                    </div>
                    <div className={classes.panelSummaryButtonDiv}>
                        {isSignedIn && <Button className={classes.signOutButton} size="small" variant="contained" disabled={loading} onClick={handleSignOutButtonClick}>Sign out</Button>}
                        {notSignedIn && <Button className={classes.signInButton} size="small" variant="contained" disabled={loading} onClick={handleSignInButtonClick}>Sign In</Button>}
                        {loading && <CircularProgress className={classes.loading} size={24} />}
                    </div>
                </div>
            </AccordianSummary>
            <AccordianDetails>
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell variant="head">Parent name:</TableCell>
                                <TableCell>{client.firstName} {client.lastName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Child year level:</TableCell>
                                <TableCell>{Utilities.retrieveFormField(childDetailsForm, acuity.FORM_FIELDS.CHILD_GRADE)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Parent mobile:</TableCell>
                                <TableCell>{client.phone}</TableCell>
                            </TableRow>
                            {hasAllergies && <TableRow>
                                <TableCell className={classes.allergies} variant="head">Allergies: {isAnaphylactic && "(ANAPHYLACTIC)"}</TableCell>
                                <TableCell className={classes.allergies}>{Utilities.retrieveFormField(childDetailsForm, acuity.FORM_FIELDS.CHILD_ALLERGIES)}</TableCell>
                            </TableRow>}
                            <TableRow>
                                <TableCell variant="head">Parent email:</TableCell>
                                <TableCell>{client.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">People allowed to pick child up:</TableCell>
                                <TableCell>
                                    <List>
                                        {mergedPickupPeople.map((person, i) => person.value !== null && <ListItem className={classes.listItem} key={i}>{person.value}</ListItem>)}
                                    </List>
                                    
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Emergency contact:</TableCell>
                                <TableCell>
                                    <List>
                                        <ListItem className={classes.listItem}>{Utilities.retrieveFormField(emergencyContactForm, acuity.FORM_FIELDS.EMERGENCY_CONTACT_NAME)} - {Utilities.retrieveFormField(emergencyContactForm, acuity.FORM_FIELDS.EMERGENCY_CONTACT_RELATION)}</ListItem>
                                        <ListItem className={classes.listItem}>{Utilities.retrieveFormField(emergencyContactForm, acuity.FORM_FIELDS.EMERGENCY_CONTACT_NUMBER)}</ListItem>
                                    </List>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {signature && signature.sig && (
                                    <>
                                    <TableCell variant="head">Signature:</TableCell>
                                    <TableCell>
                                        <List>
                                            <ListItem className={classes.listItem}><img className={classes.signature} src={signature.sig} alt="signature"/></ListItem>
                                            <ListItem className={classes.listItem}>{signature.signedBy}: {signature.timeStamp.toLocaleTimeString()}</ListItem>
                                        </List>
                                    </TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordianDetails>
        </Accordion>
        <SignatureDialog
            key={key}
            pickupPeople={mergedPickupPeople}
            open={open}
            onClose={handleCloseDialog}
            onSignOut={handleSignOut}
        />
        </>    
    )
}

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
    signInStatusIcon: {
        height: 16,
        width: 16,
        margin: 4,
        marginRight: 24
    },
    icon: {
        height: 16,
        width: 16,
        margin: 4
    },
    childName: {
        marginRight: 24
    },
    panelSummaryButtonDiv: {
        flexBasis: '30%',
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        direction: 'rtl',
        marginRight: 24
    },
    signInButton: {
        width: 'max-content',
        minWidth: 82,
        background: '#4caf50',
        "&:hover": {
            background: '#2e7d32',
            color: 'white'
        }
    },
    signOutButton: {
        width: 'max-content',
        minWidth: 82,
        background: '#e57373',
        "&:hover": {
            background: '#b71c1c',
            color: 'white'
        }
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
    },
    listItem: {
        padding: 0
    },
    allergies: {
        color: 'red'
    }
}))

export default withFirebase(ChildExpansionPanel)