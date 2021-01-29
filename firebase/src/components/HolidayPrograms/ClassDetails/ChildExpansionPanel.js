import React, { useState, useEffect } from 'react'

import { withFirebase } from '../../Firebase'
import * as acuity from '../../../constants/acuity'
import * as medicalIcon from '../../../drawables/medical-icon-24.png'
import * as checkedInIcon from '../../../drawables/tick-box-green-icon-26.png'
import * as uncheckedIcon from '../../../drawables/unchecked-icon-26.png'

import { makeStyles } from '@material-ui/styles'
import Accordion from '@material-ui/core/Accordion';
import AccordianDetails from '@material-ui/core/AccordionDetails';
import AccordianSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Button, Chip, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { green, red, blue, purple } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';

const ChildExpansionPanel = props => {

    const classes = useStyles()

    const { firebase, expanded } = props 

    const [appointment, setAppointment] = useState(props.client)
    const [loading, setLoading] = useState(false)

    const notSignedIn = appointment.labels == null
    const isSignedIn = appointment.labels != null && appointment.labels[0].id === acuity.LABELS.CHECKED_IN

    const childrenDetailsForm = appointment.forms.find(
        form => form.id === acuity.FORMS.CHILDREN_DETAILS
    )
    const childrenNames = childrenDetailsForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILDREN_NAMES
    ).value
    const allergies = childrenDetailsForm.values.find(
        field => field.fieldID === acuity.FORM_FIELDS.CHILDREN_ALLERGIES
    ).value
    const hasAllergies = allergies !== ""
    const [hasPaid, setHasPaid] = useState(appointment.paid === "yes")
    const stayingAllDay = appointment.certificate === "ALLDAY"

    const handleRecordPayment = e => {
        e.stopPropagation()
        setLoading(true)
        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: 'markPaid', appointmentId: appointment.id, amount: appointment.price }
        }).then(result => {
            console.log(result)
            setHasPaid(true)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    const handleSignInButtonClick = e => {
        e.stopPropagation()
        setLoading(true)

        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: 'updateLabel', clientId: appointment.id, label: acuity.LABELS.CHECKED_IN }
        }).then(result => {
            console.log(result)
            setAppointment(result.data)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    return (
        <>
        <Accordion
            key={appointment.id}
            expanded={expanded === appointment.id}
            onChange={props.onClientSelectionChange(appointment.id)}
        >
            <AccordianSummary className={classes.accordianSummary} expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
                <div className={!loading ? classes.panelSummary : classes.invisible}>
                    <div className={classes.checkedInIcon}>
                        {notSignedIn && <img className={classes.icon} src={uncheckedIcon.default} alt="unchecked icon"/>}
                        {isSignedIn && <img className={classes.icon} src={checkedInIcon.default} alt="checked in icon"/>}
                    </div>
                    <div className={classes.allergyIcon}>
                        {hasAllergies && <img className={classes.icon} src={medicalIcon.default} alt="medical icon"/>}
                    </div>
                    <Typography variant="button" className={classes.childInfo}>{childrenNames}</Typography>
                    <div className={classes.chip}>
                        {!hasPaid && <Chip className={classes.redChip} label="NOT PAID" />}
                        {stayingAllDay && <Chip className={classes.allDayChip} label="All Day" />}
                    </div>
                    <div className={classes.buttons}>
                        {notSignedIn && <Button className={classes.signInButton} size="small" variant="contained" disabled={loading} onClick={handleSignInButtonClick}>Sign In</Button>}
                        {!hasPaid && <Button className={classes.recordPaymentButton} size="small" variant="contained" disabled={loading} onClick={handleRecordPayment}>Record Payment</Button>}
                    </div>
                    <div className={classes.loadingDiv}>
                        {loading && <CircularProgress className={classes.loading} size={24} />}
                    </div>
                    {loading && <div className={classes.loading}>
                        <CircularProgress size={24} />
                    </div>}
                </div>
            </AccordianSummary>
            <AccordianDetails>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell variant="head">Parent Name:</TableCell>
                            <TableCell>{appointment.firstName} {appointment.lastName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Parent Phone:</TableCell>
                            <TableCell>{appointment.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Parent Email:</TableCell>
                            <TableCell>{appointment.email}</TableCell>
                        </TableRow>
                        {hasAllergies && <TableRow>
                            <TableCell className={classes.allergies} variant="head">Allergies:</TableCell>
                            <TableCell className={classes.allergies}>{allergies}</TableCell>
                        </TableRow>}
                    </TableBody>
                </Table>
            </AccordianDetails>
        </Accordion>
        </>    
    )
}

const useStyles = makeStyles(theme => ({
    accordianSummary: {
        '@media screen and (max-width: 375px)': {
            padding: '0px 5px',
            '& .MuiIconButton-root': {
                marginRight: -5
            }
        },
        '@media screen and (max-width: 510px)': {
            '& .MuiIconButton-root': {
                paddingLeft: 0
            }
        }
    },
    panelSummary: {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: '1fr minmax(20px, 1fr) minmax(30px, 4fr) minmax(30px, 2fr) minmax(50px, 4fr)'
    },
    invisible: { 
        visibility: 'hidden',
        display: 'grid',
        width: '100%',
        position: 'relative',
        gridTemplateColumns: '1fr minmax(20px, 1fr) minmax(30px, 4fr) minmax(30px, 2fr) minmax(50px, 4fr)'
    },
    chip: {
        gridColumn: 4,
        display: 'grid',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '10px'
    },
    redChip: {
        backgroundColor: red[400]
    },
    allDayChip: {
        backgroundColor: purple[200]
    },
    checkedInIcon: {
        gridColumn: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    childInfo: {
        gridColumn: 3,
        display: 'flex',
        alignItems: 'center'
    },
    allergyIcon: {
        gridColumn: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        height: 16,
        width: 16
    },
    buttons: {
        gridColumn: 5,
        display: 'grid',
        rowGap: '10px',
        justifyContent: 'center',
        justifyItems: 'center',
        alignItems: 'center',
        justifySelf: 'center'
    },
    recordPaymentButton: {
        backgroundColor: green[400],
        '&:hover': {
            backgroundColor: green[500]
        },
        '@media screen and (max-width: 510px)': {
            width: 'min-content'
        }
    },
    signInButton: {
        backgroundColor: blue[200],
        '&:hover': {
            backgroundColor: blue[500]
        }
    },
    loading: {
        display: 'flex',
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        visibility: 'visible'
    },
    allergies: {
        color: red[500]
    }
}))

export default withFirebase(ChildExpansionPanel)