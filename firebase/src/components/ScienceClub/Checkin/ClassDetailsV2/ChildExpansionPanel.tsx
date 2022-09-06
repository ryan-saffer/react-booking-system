import React, { useState, useEffect, useContext } from 'react'

import Firebase, { FirebaseContext, withFirebase } from '../../../Firebase'
import { Acuity, ScienceAppointment } from 'fizz-kidz'
import * as bannedPhotoIcon from '../../../../drawables/banned-camera-icon-24.png'
import * as medicalIcon from '../../../../drawables/medical-icon-24.png'
import * as insulinIcon from '../../../../drawables/insulin-icon-24.png'
import * as checkedInIcon from '../../../../drawables/tick-box-green-icon-26.png'
import * as checkedOutIcon from '../../../../drawables/tick-box-red-icon-26.png'
import * as uncheckedIcon from '../../../../drawables/unchecked-icon-26.png'
import * as noteIcon from '../../../../drawables/note-icon-24.png'

import { makeStyles } from '@material-ui/styles'
import Accordion from '@material-ui/core/Accordion';
import AccordianDetails from '@material-ui/core/AccordionDetails';
import AccordianSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Button, TableContainer, Table, TableRow, TableCell, List, ListItem, TableBody, Chip } from '@material-ui/core';
import { red, yellow, blue } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import StarIcon from '@material-ui/icons/Star'
import SignatureDialog from './SignatureDialog';
import { DateTime } from 'luxon'
import MenuWithActions from './MenuWithActions'
import useForceRerenderComponent from '../../../Hooks/UseForceRerenderComponent'

type Props = {
    appointment: Acuity.Appointment
    expanded: string | false
    onClientSelectionChange: any
}

const ChildExpansionPanel = (props: Props) => {

    const classes = useStyles()

    const { expanded } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointment, setAppointment] = useState(props.appointment)
    const [firestoreDocument, setFirestoreDocument] = useState<ScienceAppointment | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [signature, setSignature] = useState<any>(null)
    const [key, setKey] = useState(0)

    const isSignedIn = appointment.labels != null && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_IN
    const isSignedOut = appointment.labels != null && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_OUT
    const [notAttending, setNotAttending] = useState(appointment.labels !== null && appointment.labels[0].id === Acuity.Constants.Labels.NOT_ATTENDING)
    const notSignedIn = appointment.labels == null && !notAttending

    useEffect(() => {
        const fetchSignature = () => {
            firebase.db.collection('scienceClubAppointments').doc(`${appointment.id}`).get()
                .then(documentSnapshot => {
                    const sig = documentSnapshot.get('signature')
                    const signedBy = documentSnapshot.get('pickupPerson')
                    const timeStamp = documentSnapshot.get('timeStamp')
                    setSignature({sig, signedBy, timeStamp: timeStamp ? timeStamp.toDate() : ""})
                })
                .catch(err => {
                    console.log(`Error getting signature: ${err}`)
                })
        
        }

        fetchSignature()

    }, [firebase.db, appointment.id])

    useEffect(() => {
        async function fetchAppointment() {
            const firestoreId = Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.FIRESTORE, Acuity.Constants.FormFields.FIRESTORE_ID)
            let firestoreDocument = await firebase.db.collection('scienceAppointments').doc(firestoreId).get()
            setFirestoreDocument(firestoreDocument.data() as ScienceAppointment)
            setLoading(false)
        }

        fetchAppointment()
    }, [])

    const pickupPeople = Acuity.Utilities.retrieveForm(appointment, Acuity.Constants.Forms.PICKUP_PERMISSION)
    const mergedPickupPeople = [{id: appointment.id, value: `${appointment.firstName} ${appointment.lastName}`}, ...pickupPeople || []]
    const childName = firestoreDocument?.childName
    const isInPrep = firestoreDocument?.childGrade === "Prep"
    const isAnaphylactic = firestoreDocument?.childIsAnaphylactic
    const permissionToPhotograph = firestoreDocument?.permissionToPhotograph
    const hasNotes = firestoreDocument?.notes ? true : false

    const handleSignInButtonClick = (e: any) => {
        e.stopPropagation()
        setLoading(true)

        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser?.toJSON(),
            data: { method: 'updateLabel', clientId: appointment.id, label: Acuity.Constants.Labels.CHECKED_IN }
        }).then(result => {
            console.log(result)
            setAppointment(result.data)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    const handleSignOutButtonClick = (e: any) => {
        e.stopPropagation()
        // check here for lunchtime classes, which don't require a sign out
        let dateTime = DateTime.fromISO(appointment.datetime)
        if (dateTime.hour < 14) { // class starts before 2pm, ie lunchtime class
            handleSignOut("N/A - Lunchtime class", "")
        } else {
            setOpen(true)
        }
    }

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleSignOut = (pickupPerson: any, dataUrl: any) => {
        console.log(`DATA URL: ${dataUrl}`)

        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser?.toJSON(),
            data: { method: 'updateLabel', clientId: appointment.id, label: Acuity.Constants.Labels.CHECKED_OUT }
        }).then(functionsResult => {
            console.log(functionsResult)
            firebase.db.doc(`scienceClubAppointments/${appointment.id}/`).set({
                pickupPerson: pickupPerson,
                signature: dataUrl,
                timeStamp: new Date()
            }).then(firestoreResult => {
                console.log(`Firestore result: ${firestoreResult}`)
                setAppointment(functionsResult.data)
                setSignature({sig: dataUrl, signedBy: pickupPerson, timeStamp: new Date()})
                setLoading(false)
                setOpen(false)
                setKey(key => key + 1)
            })
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    return (
        <>
        <Accordion
            key={appointment.id}
            expanded={expanded === appointment.id.toString()}
            onChange={props.onClientSelectionChange(appointment.id.toString())}
        >
            <AccordianSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.panelSummary}>
                    <div className={classes.panelSummaryDetails}>
                        {notSignedIn && <img className={classes.signInStatusIcon} src={uncheckedIcon.default} alt="unchecked icon"/>}
                        {notAttending && <div className={classes.signInStatusIcon} />}
                        {isSignedIn && <img className={classes.signInStatusIcon} src={checkedInIcon.default} alt="checked in icon"/>}
                        {isSignedOut && <img className={classes.signInStatusIcon} src={checkedOutIcon.default} alt="checked out icon"/>}
                        <MenuWithActions 
                            appointment={appointment}
                            firestoreDocument={firestoreDocument}
                            setLoading={setLoading}
                            setNotAttending={setNotAttending}
                        />
                        <Typography className={classes.childName} variant="button">{childName}</Typography>
                        {isInPrep && <StarIcon style={{ color: yellow[800] }} />}
                        {firestoreDocument?.childAllergies && <img className={classes.icon} src={medicalIcon.default} alt="medical icon"/>}
                        {isAnaphylactic && <img className={classes.icon} src={insulinIcon.default} alt="insulin icon" />}
                        {hasNotes && <img className={classes.icon} src={noteIcon.default} alt="notes icon" />}
                        {!permissionToPhotograph && <img className={classes.icon} src={bannedPhotoIcon.default} alt="banned camera icon"/>}
                        {notAttending && <Chip className={classes.chip} label="Not Attending" />}
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
                                <TableCell>{appointment.firstName} {appointment.lastName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Child year level:</TableCell>
                                <TableCell>{firestoreDocument?.childGrade}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Parent mobile:</TableCell>
                                <TableCell>{appointment.phone}</TableCell>
                            </TableRow>
                            {hasNotes && <TableRow>
                                <TableCell className={classes.notes} variant='head'>Notes:</TableCell>
                                <TableCell className={classes.notes}>{appointment.notes}</TableCell>
                            </TableRow>}
                            {firestoreDocument?.childAllergies && <TableRow>
                                <TableCell className={classes.allergies} variant="head">Allergies: {isAnaphylactic && "(ANAPHYLACTIC)"}</TableCell>
                                <TableCell className={classes.allergies}>{firestoreDocument?.childAllergies}</TableCell>
                            </TableRow>}
                            <TableRow>
                                <TableCell variant="head">Parent email:</TableCell>
                                <TableCell>{appointment.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">People allowed to pick child up:</TableCell>
                                <TableCell>
                                    <List>
                                        {mergedPickupPeople?.map((person, i) => person.value !== null && <ListItem className={classes.listItem} key={i}>{person.value}</ListItem>)}
                                    </List>
                                    
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head">Emergency contact:</TableCell>
                                <TableCell>
                                    <List>
                                        <ListItem className={classes.listItem}>{firestoreDocument?.emergencyContactName} - {firestoreDocument?.emergencyContactRelation}</ListItem>
                                        <ListItem className={classes.listItem}>{firestoreDocument?.emergencyContactNumber}</ListItem>
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
    chip: {
      background: red[400],
      marginLeft: 15
    },
    signInStatusIcon: {
        height: 16,
        width: 16,
        margin: 4,
        marginRight: 24
    },
    icon: {
        height: 20,
        width: 20,
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
        marginRight: 16
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
    },
    notes: {
        color: blue[500]
    }
}))

export default ChildExpansionPanel