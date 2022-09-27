import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { compose } from 'recompose'

import ChildExpansionPanel from './ChildExpansionPanel'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Acuity } from 'fizz-kidz'
import * as bannedPhotoIcon from '../../../../drawables/banned-camera-icon-24.png'
import * as medicalIcon from '../../../../drawables/medical-icon-24.png'
import * as insulinIcon from '../../../../drawables/insulin-icon-24.png'
import * as noteIcon from '../../../../drawables/note-icon-24.png'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import SkeletonRows from '../../../Shared/SkeletonRows'
import { Dialog, DialogTitle, List, ListItem, Divider } from '@material-ui/core'
import StarIcon from '@material-ui/icons/StarOutlined'
import { yellow } from '@material-ui/core/colors'
import useFetchAppointments from '../../../Hooks/api/UseFetchAppointments'

const ScienceClubCheckinClassDetails = props => {
    
    const classes = useStyles()

    const { height } = useWindowDimensions();

    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showHelpDialog, setShowHelpDialog] = useState(false)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeId = queries.appointmentTypeId
    const calendarId = queries.calendarId
    const classId = parseInt(queries.classId)
    const calendarName = decodeURIComponent(queries.calendarName)

    const sortByChildName = (a, b) => {
        const aName = Acuity.Utilities.retrieveFormAndField(a, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)
        const bName = Acuity.Utilities.retrieveFormAndField(b, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)
        return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        sorter: sortByChildName
    })

    const navigateBack = () => {
        props.history.goBack()
    }
    const handleClientSelectionChange = panel => (_, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    }

    return (
        <div className={classes.main}>
            <CssBaseline />
            <AppBar className={classes.appBar} position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={navigateBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color='inherit'>
                        Children
                    </Typography>
                    <HelpOutlineIcon className={classes.helpIcon} onClick={() => setShowHelpDialog(true)} />
                </Toolbar>
            </AppBar>
            <Typography variant='h6' className={classes.calendarName}>
                {calendarName}
            </Typography>
            <Divider />
            {appointments !== null ? appointments.map(appointment => (
                <ChildExpansionPanel
                    key={appointment.id}
                    appointment={appointment}
                    onClientSelectionChange={handleClientSelectionChange}
                    expanded={expanded}
                />
            )) : <Typography className={classes.noEnrolments} variant="h5">No one is enrolled</Typography>}
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
            <IconsDialog open={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
        </div>
    )
}

const IconsDialog = props => {

    const classes = useStyles()

    const { open, onClose } = props

    const IconListItem = ({icon, text}) => (
        <ListItem>
            <div>
                <img src={icon} />
            </div>
            <Typography>{text}</Typography>
        </ListItem>
    )

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className={classes.dialogTitle}>Icons Guide</DialogTitle>
            <List className={classes.list}>
                <ListItem>
                    <div>
                        <StarIcon style={{ color: yellow[800] }} />
                    </div>
                    <Typography>Child is in Prep</Typography>
                </ListItem>
                <IconListItem icon={medicalIcon.default} text="Child has allergies" />
                <IconListItem icon={insulinIcon.default} text="Child is anaphylactic" />
                <IconListItem icon={noteIcon.default} text="Child has notes" />
                <IconListItem icon={bannedPhotoIcon.default} text="Do not photograph child" />
            </List>
        </Dialog>
    )

}

const useStyles = makeStyles(theme => ({
    main: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    dialogTitle: {
        paddingBottom: '0px'
    },
    list: {
        '& li': {
            display: 'grid',
            gridTemplateColumns: '1fr 3fr'
        },
        '& div': {
            display: 'flex',
            justifyContent: 'center'
        }
    },
    helpIcon: {
        position: 'absolute',
        right: '24px'
    },
    noEnrolments: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0, left: 0,
        color: 'grey',
        pointerEvents: 'none'
    },
    calendarName: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    }
}))

export default compose(
    withRouter,
)(ScienceClubCheckinClassDetails)