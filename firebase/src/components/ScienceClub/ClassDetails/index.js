import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'

import queryString from 'query-string'
import { compose } from 'recompose'

import { withFirebase } from '../../Firebase'
import ChildExpansionPanel from '../ChildExpansionPanel'

import Typography from '@material-ui/core/Typography'

const ClassDetailsPage = props => {

    const { firebase } = props

    const [clients, setClients] = useState([])
    const [expanded, setExpanded] = useState(false)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeID = queries.appointmentTypeId
    const calendarID = queries.calendarId
    const classID = parseInt(queries.classId)

    useEffect(() => {

        firebase.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                fetchClients({ appointmentTypeID, calendarID })
            }
        })
    }, [])

    const handleClientSelectionChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    }
    
    const fetchClients = data => {
        console.log(data)
        console.log(classID)
        firebase.functions.httpsCallable('getAppointments')({
            auth: firebase.auth.currentUser.toJSON(),
            data: data
        }).then(result => {
            console.log(result)
            setClients(
                result.data.filter(x => x.classID === classID)
            )
        }).catch(err => {
            console.error(err)
        })
    }

    return (
        <>
        <Typography variant='h6'>Children:</Typography>
        {clients.map(client => (
            <ChildExpansionPanel
                key={client.id}
                client={client}
                onClientSelectionChange={handleClientSelectionChange}
                expanded={expanded}
            />
        ))}
        </>
    )
}

export default compose(
    withRouter,
    withFirebase,
)(ClassDetailsPage)