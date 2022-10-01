import React, { useState, useEffect, useContext, useMemo } from 'react'

import Firebase, { FirebaseContext } from '../../../Firebase'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import * as bannedPhotoIcon from '../../../../drawables/banned-camera-icon-24.png'
import * as medicalIcon from '../../../../drawables/medical-icon-24.png'
import * as insulinIcon from '../../../../drawables/insulin-icon-24.png'
import * as checkedInIcon from '../../../../drawables/tick-box-green-icon-26.png'
import * as checkedOutIcon from '../../../../drawables/tick-box-red-icon-26.png'
import * as uncheckedIcon from '../../../../drawables/unchecked-icon-26.png'
import * as noteIcon from '../../../../drawables/note-icon-24.png'

import { makeStyles } from '@material-ui/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordianDetails from '@material-ui/core/AccordionDetails'
import AccordianSummary from '@material-ui/core/AccordionSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { Button, TableContainer, Table, TableRow, TableCell, List, ListItem, TableBody, Chip } from '@material-ui/core'
import { red, yellow, blue } from '@material-ui/core/colors'
import CircularProgress from '@material-ui/core/CircularProgress'
import StarIcon from '@material-ui/icons/Star'
import SignatureDialog from './SignatureDialog'
import { DateTime } from 'luxon'
import MenuWithActions from './MenuWithActions'
import { callAcuityClientV2, callFirebaseFunction } from '../../../../utilities/firebase/functions'

type Props = {
    appointment: Acuity.Appointment
    firestoreDocument: ScienceEnrolment
    expanded: string | false
    onClientSelectionChange: any
}

const ChildExpansionPanel = (props: Props) => {
    const classes = useStyles()

    const { expanded } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const [appointment, setAppointment] = useState(props.appointment)
    const [firestoreDocument, setFirestoreDocument] = useState(props.firestoreDocument)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [key, setKey] = useState(0)
    const [anaphylaxisUrl, setAnaphylaxisUrl] = useState('')

    const isSignedIn = appointment.labels != null && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_IN
    const isSignedOut = appointment.labels != null && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_OUT

    const [notAttending, setNotAttending] = useState(
        appointment.labels !== null && appointment.labels[0].id === Acuity.Constants.Labels.NOT_ATTENDING
    )
    const notSignedIn = appointment.labels == null && !notAttending

    useEffect(() => {
        if (firestoreDocument.child.isAnaphylactic) {
            firebase.storage
                .ref(`anaphylaxisPlans/${firestoreDocument.id}/${firestoreDocument.child.anaphylaxisPlan}`)
                .getDownloadURL()
                .then((url) => {
                    console.log(url)
                    setAnaphylaxisUrl(url)
                })
                .catch((error) => console.error(error))
        }
    }, [])

    const mergedPickupPeople = [`${appointment.firstName} ${appointment.lastName}`, ...firestoreDocument.pickupPeople]
    const isInPrep = firestoreDocument.child.grade === 'Prep'
    const isAnaphylactic = firestoreDocument.child.isAnaphylactic
    const permissionToPhotograph = firestoreDocument.child.permissionToPhotograph
    const hasNotes = firestoreDocument.notes ? true : false

    const handleSignInButtonClick = async (e: any) => {
        e.stopPropagation()
        setAttendance(true)
    }

    const setAttendance = async (signingIn: boolean) => {
        setLoading(true)

        const result = await callAcuityClientV2(
            'updateAppointment',
            firebase
        )({
            id: appointment.id,
            labels: signingIn ? [{ id: Acuity.Constants.Labels.CHECKED_IN }] : [],
        })

        setAppointment(result.data)
        setLoading(false)
    }

    const handleSignOutButtonClick = (e: any) => {
        e.stopPropagation()
        // check here for lunchtime classes, which don't require a sign out
        let dateTime = DateTime.fromISO(appointment.datetime)
        if (dateTime.hour < 14) {
            // class starts before 2pm, ie lunchtime class
            handleSignOut('N/A - Lunchtime class', '')
        } else {
            setOpen(true)
        }
    }

    const handleSignOut = async (pickupPerson: string, dataUrl: string) => {
        try {
            const acuityResult = await callAcuityClientV2(
                'updateAppointment',
                firebase
            )({
                id: appointment.id,
                labels: [{ id: Acuity.Constants.Labels.CHECKED_OUT }],
            })

            const updatedApointment = await callFirebaseFunction(
                'updateScienceEnrolment',
                firebase
            )({
                id: firestoreDocument.id,
                signatures: {
                    ...firestoreDocument.signatures,
                    [appointment.id]: {
                        pickupPerson,
                        timestamp: Date.now(),
                        signature: dataUrl,
                    },
                },
            })
            setFirestoreDocument(updatedApointment.data)
            setAppointment(acuityResult.data)
            setLoading(false)
            setOpen(false)
            setKey((key) => key + 1)
        } catch (err) {
            setLoading(false)
        }
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
                            {notSignedIn && (
                                <img
                                    className={classes.signInStatusIcon}
                                    src={uncheckedIcon.default}
                                    alt="unchecked icon"
                                />
                            )}
                            {notAttending && <div className={classes.signInStatusIcon} />}
                            {isSignedIn && (
                                <img
                                    className={classes.signInStatusIcon}
                                    src={checkedInIcon.default}
                                    alt="checked in icon"
                                />
                            )}
                            {isSignedOut && (
                                <img
                                    className={classes.signInStatusIcon}
                                    src={checkedOutIcon.default}
                                    alt="checked out icon"
                                />
                            )}
                            <MenuWithActions
                                appointment={appointment}
                                firestoreDocument={firestoreDocument}
                                setLoading={setLoading}
                                setNotAttending={setNotAttending}
                            />
                            <Typography className={classes.childName} variant="button">
                                {firestoreDocument.child.firstName} {firestoreDocument.child.lastName}
                            </Typography>
                            {isInPrep && <StarIcon style={{ color: yellow[800] }} />}
                            {firestoreDocument.child.allergies && (
                                <img className={classes.icon} src={medicalIcon.default} alt="medical icon" />
                            )}
                            {isAnaphylactic && (
                                <img className={classes.icon} src={insulinIcon.default} alt="insulin icon" />
                            )}
                            {hasNotes && <img className={classes.icon} src={noteIcon.default} alt="notes icon" />}
                            {!permissionToPhotograph && (
                                <img className={classes.icon} src={bannedPhotoIcon.default} alt="banned camera icon" />
                            )}
                            {notAttending && <Chip className={classes.chip} label="Not Attending" />}
                        </div>
                        <div className={classes.panelSummaryButtonDiv}>
                            {isSignedIn && (
                                <Button
                                    className={classes.signOutButton}
                                    size="small"
                                    variant="contained"
                                    disabled={loading}
                                    onClick={handleSignOutButtonClick}
                                >
                                    Sign out
                                </Button>
                            )}
                            {notSignedIn && (
                                <Button
                                    className={classes.signInButton}
                                    size="small"
                                    variant="contained"
                                    disabled={loading}
                                    onClick={handleSignInButtonClick}
                                >
                                    Sign In
                                </Button>
                            )}
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
                                    <TableCell>
                                        {appointment.firstName} {appointment.lastName}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Child year level:</TableCell>
                                    <TableCell>{firestoreDocument.child.grade}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Parent mobile:</TableCell>
                                    <TableCell>{appointment.phone}</TableCell>
                                </TableRow>
                                {hasNotes && (
                                    <TableRow>
                                        <TableCell className={classes.notes} variant="head">
                                            Notes:
                                        </TableCell>
                                        <TableCell className={classes.notes}>{appointment.notes}</TableCell>
                                    </TableRow>
                                )}
                                {firestoreDocument.child.allergies && (
                                    <TableRow>
                                        <TableCell className={classes.allergies} variant="head">
                                            Allergies: {isAnaphylactic && '(ANAPHYLACTIC)'}
                                        </TableCell>
                                        <TableCell className={classes.allergies}>
                                            {firestoreDocument.child.allergies}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {firestoreDocument.child.isAnaphylactic && (
                                    <TableRow>
                                        <TableCell className={classes.allergies} variant="head">
                                            Anaphylaxis Plan
                                        </TableCell>
                                        <TableCell className={classes.allergies}>
                                            <Button
                                                variant="outlined"
                                                href={anaphylaxisUrl}
                                                target="_blank"
                                                color="primary"
                                            >
                                                Open Anaphylaxis Plan
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell variant="head">Parent email:</TableCell>
                                    <TableCell>{appointment.email}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">People allowed to pick child up:</TableCell>
                                    <TableCell>
                                        <List>
                                            {mergedPickupPeople.map(
                                                (person, i) =>
                                                    person !== null && (
                                                        <ListItem className={classes.listItem} key={i}>
                                                            {person}
                                                        </ListItem>
                                                    )
                                            )}
                                        </List>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Emergency contact:</TableCell>
                                    <TableCell>
                                        <List>
                                            <ListItem className={classes.listItem}>
                                                {firestoreDocument.emergencyContact.name}
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                {firestoreDocument.emergencyContact.phone}
                                            </ListItem>
                                        </List>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    {(() => {
                                        const signature = firestoreDocument.signatures[appointment.id]
                                        if (signature.pickupPerson) {
                                            return (
                                                <>
                                                    <TableCell variant="head">Signature:</TableCell>
                                                    <TableCell>
                                                        <List>
                                                            <ListItem className={classes.listItem}>
                                                                <img
                                                                    className={classes.signature}
                                                                    src={signature.signature}
                                                                    alt="signature"
                                                                />
                                                            </ListItem>
                                                            <ListItem className={classes.listItem}>
                                                                {signature.pickupPerson}:{' '}
                                                                {new Date(signature.timestamp).toLocaleTimeString()}
                                                            </ListItem>
                                                        </List>
                                                    </TableCell>
                                                </>
                                            )
                                        }
                                    })()}
                                </TableRow>
                                {isSignedIn && (
                                    <TableRow>
                                        <TableCell colSpan={2} style={{ textAlign: 'end' }}>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => setAttendance(false)}
                                            >
                                                Undo Sign In
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {isSignedOut && (
                                    <TableRow>
                                        <TableCell colSpan={2} style={{ textAlign: 'end' }}>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => setAttendance(true)}
                                            >
                                                Undo Sign Out
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordianDetails>
            </Accordion>
            <SignatureDialog
                key={key}
                pickupPeople={mergedPickupPeople}
                open={open}
                onClose={() => setOpen(false)}
                onSignOut={handleSignOut}
            />
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    panelSummary: {
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
    },
    panelSummaryDetails: {
        flexBasis: '70%',
        display: 'flex',
        alignItems: 'center',
    },
    chip: {
        background: red[400],
        marginLeft: 15,
    },
    signInStatusIcon: {
        height: 16,
        width: 16,
        margin: 4,
        marginRight: 24,
    },
    icon: {
        height: 20,
        width: 20,
        margin: 4,
    },
    childName: {
        marginRight: 24,
    },
    panelSummaryButtonDiv: {
        flexBasis: '30%',
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        direction: 'rtl',
        marginRight: 24,
    },
    signInButton: {
        width: 'max-content',
        minWidth: 82,
        background: '#4caf50',
        '&:hover': {
            background: '#2e7d32',
            color: 'white',
        },
    },
    signOutButton: {
        width: 'max-content',
        minWidth: 82,
        background: '#e57373',
        '&:hover': {
            background: '#b71c1c',
            color: 'white',
        },
    },
    column: {
        flexBasis: '50.00%',
        display: 'flex',
        flexDirection: 'column',
    },
    heading: {
        marginTop: 8,
    },
    loading: {
        marginRight: 16,
    },
    error: {
        color: red[500],
        display: 'flex',
        flexDirection: 'column',
    },
    signature: {
        width: 'fit-content',
    },
    listItem: {
        padding: 0,
    },
    allergies: {
        color: 'red',
    },
    notes: {
        color: blue[500],
    },
}))

export default ChildExpansionPanel
