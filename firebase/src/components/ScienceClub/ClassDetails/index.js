import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { compose } from 'recompose'
import LoadingOverlay from 'react-loading-overlay'

import { withFirebase } from '../../Firebase'
import ChildExpansionPanel from './ChildExpansionPanel'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const useStyles = makeStyles( theme => ({
    main: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
}))

const ClassDetailsPage = props => {
    
    const classes = useStyles()

    const { firebase } = props

    const [clients, setClients] = useState([])
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeID = queries.appointmentTypeId
    const calendarID = queries.calendarId
    const classID = parseInt(queries.classId)

    useEffect(() => {

        const fetchClients = data => {
            console.log(data)
            console.log(classID)
            firebase.functions.httpsCallable('acuityClient')({
                auth: firebase.auth.currentUser.toJSON(),
                data: { method: 'getAppointments', ...data }
            }).then(result => {
                console.log(result)
                setClients(
                    result.data.filter(x => x.classID === classID)
                )
                setLoading(false)
            }).catch(err => {
                console.error(err)
                setLoading(false)
            })
        }
        
        if (firebase.auth.currentUser) {
            fetchClients({ appointmentTypeID, calendarID })
        }
        
    }, [firebase.auth.currentUser, appointmentTypeID, calendarID])

    const navigateBack = () => {
        props.history.goBack()
    }
    const handleClientSelectionChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    }

    return (
        <div className={classes.main}>
            <LoadingOverlay
                active={loading}
                className={classes.main}
                spinner
            >
                <CssBaseline />
                <AppBar className={classes.appBar} position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={navigateBack}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6">
                            Children
                        </Typography>
                    </Toolbar>
                </AppBar>
                {clients.map(client => (
                    <ChildExpansionPanel
                        key={client.id}
                        client={client}
                        onClientSelectionChange={handleClientSelectionChange}
                        expanded={expanded}
                    />
                ))}
            </LoadingOverlay>
        </div>
    )
}

export default compose(
    withRouter,
    withFirebase,
)(ClassDetailsPage)