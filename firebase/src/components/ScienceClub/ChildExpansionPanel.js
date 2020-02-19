import React, { useState, useEffect } from 'react'

import { withFirebase } from '../Firebase'
import * as acuity from '../../constants/acuity'

import { makeStyles } from '@material-ui/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import SignatureDialog from './SignatureDialog';

const useStyles = makeStyles({
    column1: {
        flexBasis: '50.00%',
        flexShrink: 0
    },
    childInfo: {
        flexBasis: "20%",
        flexShrink: 0
    },
    chipCheckedIn: {
        marginLeft: 16,
        marginRight: 16
    },
    chipCheckedOut: {
        marginLeft: 16,
        marginRight: 16
    }
})

const ChildExpansionPanel = props => {

    const classes = useStyles()

    const { firebase, expanded } = props

    const [client, setClient] = useState(props.client)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [signature, setSignature] = useState(null)

    useEffect(() => {
        fetchSignature()
    }, [])

    var formAnswers = client.forms.find(
        form => form.id === 1238061
            || form.id === 1198916
            || form.id === 1283715
            || form.id === 1287124
            || form.id === 1316104
    )
    var childName = formAnswers.values[0].value
    var allergies = formAnswers.values[1].value

    const fetchSignature = () => {
        firebase.db.collection('scienceClubAppointments').doc(`${client.id}`).get()
            .then(documentSnapshot => {
                console.log(documentSnapshot)
                const sig = documentSnapshot.get('signature')
                    console.log(sig)
                    setSignature(sig)
            })
            .catch(err => {
                console.log(`Error getting signature: ${err}`)
            })
    }

    const handleSignInButtonClick = e => {
        e.stopPropagation()
        setLoading(true)

        firebase.functions.httpsCallable('updateLabel')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { clientId: client.id, label: acuity.LABELS.CHECKED_IN }
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

    const handleSignOut = dataUrl => {
        console.log(`DATA URL: ${dataUrl}`)

        // setLoading(true)

        firebase.functions.httpsCallable("updateLabel")({
            auth: firebase.auth.currentUser.toJSON(),
            data: { clientId: client.id, label: acuity.LABELS.CHECKED_OUT }
        }).then(functionsResult => {
            console.log(functionsResult)
            firebase.db.doc(`scienceClubAppointments/${client.id}/`).set({
                signature: dataUrl,
                timeStamp: new Date()
            }).then(firestoreResult => {
                console.log(`Firestore result: ${firestoreResult}`)
                setClient(functionsResult.data)
                setSignature(dataUrl)
                setLoading(false)
                setOpen(false)
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
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography className={classes.childInfo}>{childName}</Typography>
                {client.labels != null && client.labels[0].id === acuity.LABELS.CHECKED_IN
                    ? (
                        <>
                        <Chip className={classes.chipCheckedIn} classes={{ colorPrimary: green[500] }} label={"Checked in"} />
                        <Button variant="contained" color="secondary" disabled={loading} onClick={handleSignOutButtonClick}>Sign out</Button>
                        </>
                    ) : (
                        <>
                        <Chip className={classes.chipCheckedOut} classes={{ colorPrimary: red[500] }} label={"Checked out"} />
                        <Button variant="contained" color="primary" disabled={loading} onClick={handleSignInButtonClick}>Sign In</Button>
                        </>
                    )
                }
                {loading && <CircularProgress size={24} />}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className={classes.column1}>
                    <Typography variant="button">Parent name:</Typography>
                    <Typography variant="body1">{client.firstName} {client.lastName}</Typography>
                    <Typography variant="button">Parent email:</Typography>
                    <Typography variant="body1">{client.email}</Typography>
                </div>
                <div>
                    <Typography variant="button">Parent mobile:</Typography>
                    <Typography vairant="body1">{client.phone}</Typography>
                    {signature
                        ? (
                            <>
                                <Typography variant="button">Signature</Typography>
                                <img src={signature} />
                            </>
                        ) : null
                    }
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        <SignatureDialog open={open} onClose={handleCloseDialog} onSignOut={handleSignOut} />
        </>    
    )
}

export default withFirebase(ChildExpansionPanel)