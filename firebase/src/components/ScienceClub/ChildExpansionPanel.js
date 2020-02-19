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

const useStyles = makeStyles({
    column1: {
        flexBasis: '50.00%',
        flexShrink: 0
    },
    test: {
        justifyContent: 'flex-start'
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
    },
    signInButton: {
        marginTop: 'auto'
    }
})

const ChildExpansionPanel = props => {

    const classes = useStyles()

    const { firebase, expanded } = props

    const [client, setClient] = useState(props.client)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setClient(props.client)
        setLoading(false)
    }, [props.client])

    var formAnswers = client.forms.find(
        form => form.id === 1238061
            || form.id === 1198916
            || form.id === 1283715
            || form.id === 1287124
            || form.id === 1316104
    )
    var childName = formAnswers.values[0].value
    var allergies = formAnswers.values[1].value

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
        })
    }

    const handleSignOutButtonClick = e => {
        e.stopPropagation()
        setLoading(true)

        firebase.functions.httpsCallable("updateLabel")({
            auth: firebase.auth.currentUser.toJSON(),
            data: { clientId: client.id, label: acuity.LABELS.CHECKED_OUT }
        }).then(result => {
            console.log(result)
            setClient(result.data)
            setLoading(false)
        }).catch(err => {
            console.err(err)
        })
    }

    return (
        <ExpansionPanel
            key={client.id}
            expanded={expanded === client.id}
            onChange={() => props.onClientSelectionChange(client.id)}
        >
            <ExpansionPanelSummary
                className={classes.test}
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
                    <Typography vairant="body1">{client.email}</Typography>
                </div>
                <div>
                    <Typography variant="button">Parent mobile:</Typography>
                    <Typography vairant="body1">{client.phone}</Typography>
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
}

export default withFirebase(ChildExpansionPanel)