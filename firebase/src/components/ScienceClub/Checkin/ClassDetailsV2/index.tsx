import React, { useContext, useEffect, useState } from 'react'
import { useHistory, withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { compose } from 'recompose'

import ChildExpansionPanel from './ChildExpansionPanel'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Acuity, ScienceAppointment } from 'fizz-kidz'
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
import useQueryParam from '../../../Hooks/UseQueryParam'
import Firebase, { FirebaseContext } from '../../../Firebase'

type Props = {}

const ScienceClubCheckinClassDetails = (props: Props) => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const { height } = useWindowDimensions()

    const history = useHistory()

    // a map will speed up finding the corresponding firestore booking from acuity appointment
    const [firestoreDocuments, setFirestoreDocuments] = useState<{ [key: string]: ScienceAppointment }>({})
    const [expanded, setExpanded] = useState<string | false>(false)
    const [loading, setLoading] = useState(true)
    const [showHelpDialog, setShowHelpDialog] = useState(false)

    const appointmentTypeId = parseInt(useQueryParam('appointmentTypeId') as string)
    const calendarId = parseInt(useQueryParam('calendarId') as string)
    const classId = parseInt(useQueryParam('classId') as string)
    const calendarName = decodeURIComponent(useQueryParam('calendarName') as string)

    const sortByChildName = (a: string, b: string) => {
        const aName = Acuity.Utilities.retrieveFormAndField(
            a,
            Acuity.Constants.Forms.CHILD_DETAILS,
            Acuity.Constants.FormFields.CHILD_NAME
        )
        const bName = Acuity.Utilities.retrieveFormAndField(
            b,
            Acuity.Constants.Forms.CHILD_DETAILS,
            Acuity.Constants.FormFields.CHILD_NAME
        )
        return aName < bName ? -1 : aName > bName ? 1 : 0
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
    })

    useEffect(() => {
        firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .get()
            .then((result) => {
                let obj: { [key: string]: ScienceAppointment } = {}
                result.docs.forEach((doc) => {
                    let appointment = doc.data() as ScienceAppointment
                    obj[appointment.id] = appointment
                })
                setFirestoreDocuments(obj)
            })
    }, [])

    const navigateBack = () => {
        history.goBack()
    }
    const handleClientSelectionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
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
                    <Typography variant="h6" color="inherit">
                        Children
                    </Typography>
                    <HelpOutlineIcon className={classes.helpIcon} onClick={() => setShowHelpDialog(true)} />
                </Toolbar>
            </AppBar>
            <Typography variant="h6" className={classes.calendarName}>
                {calendarName}
            </Typography>
            <Divider />
            {appointments !== null && firestoreDocuments !== {} ? (
                appointments.map((appointment) => {
                    const firestoreId = Acuity.Utilities.retrieveFormAndField(
                        appointment,
                        Acuity.Constants.Forms.FIRESTORE,
                        Acuity.Constants.FormFields.FIRESTORE_ID
                    )
                    return (
                        <ChildExpansionPanel
                            key={appointment.id}
                            appointment={appointment}
                            firestoreDocument={firestoreDocuments[firestoreId]}
                            onClientSelectionChange={handleClientSelectionChange}
                            expanded={expanded}
                        />
                    )
                })
            ) : (
                <Typography className={classes.noEnrolments} variant="h5">
                    No one is enrolled
                </Typography>
            )}
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
            <IconsDialog open={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
        </div>
    )
}

type IconsDialogProps = {
    open: boolean
    onClose: () => void
}

const IconsDialog = (props: IconsDialogProps) => {
    const classes = useStyles()

    const { open, onClose } = props

    const IconListItem = ({ icon, text }: { icon: string; text: string }) => (
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

const useStyles = makeStyles((theme) => ({
    main: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    dialogTitle: {
        paddingBottom: '0px',
    },
    list: {
        '& li': {
            display: 'grid',
            gridTemplateColumns: '1fr 3fr',
        },
        '& div': {
            display: 'flex',
            justifyContent: 'center',
        },
    },
    helpIcon: {
        position: 'absolute',
        right: '24px',
    },
    noEnrolments: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        color: 'grey',
        pointerEvents: 'none',
    },
    calendarName: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
}))

export default compose(withRouter)(ScienceClubCheckinClassDetails)
