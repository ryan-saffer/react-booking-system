import React, { useState } from 'react'
import { useHistory, withRouter } from 'react-router-dom'

import ChildExpansionPanel from './ChildExpansionPanel'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import { Acuity } from 'fizz-kidz'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SkeletonRows from '../../Shared/SkeletonRows'
import useFetchAppointments from '../../Hooks/UseFetchAppointments'
import useQueryParam from '../../Hooks/UseQueryParam'
import { Card, Collapse, Empty } from 'antd'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'

const ClassDetailsPage = () => {
    const classes = useStyles()

    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)

    const appointmentTypeId = parseInt(useQueryParam('appointmentTypeId') as string)
    const calendarId = parseInt(useQueryParam('calendarId') as string)
    const classId = parseInt(useQueryParam('classId') as string)
    const classDisplayable = decodeURIComponent(useQueryParam('class') as string)

    const history = useHistory()

    const sortByChildName = (a: Acuity.Appointment, b: Acuity.Appointment) => {
        const aName = Acuity.Utilities.retrieveFormAndField(
            a,
            Acuity.Constants.Forms.CHILDREN_DETAILS,
            Acuity.Constants.FormFields.CHILDREN_NAMES
        )
        const bName = Acuity.Utilities.retrieveFormAndField(
            b,
            Acuity.Constants.Forms.CHILDREN_DETAILS,
            Acuity.Constants.FormFields.CHILDREN_NAMES
        )
        return aName < bName ? -1 : aName > bName ? 1 : 0
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        sorter: sortByChildName,
    }) as Acuity.Appointment[]

    const navigateBack = () => {
        history.goBack()
    }

    return (
        <div className={classes.main}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar style={{ display: 'flex' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton edge="start" color="inherit" onClick={navigateBack}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                            Children
                        </Typography>
                    </div>
                    <div style={{ flex: '1 1 auto' }}>
                        <Typography style={{ textAlign: 'center' }} variant="h6" color="inherit">
                            {classDisplayable}
                        </Typography>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <img src={Logo.default} style={{ maxWidth: 100 }} />
                    </div>
                </Toolbar>
            </AppBar>
            <div className={classes.root}>
                <Card className={classes.card}>
                    {appointments !== null && appointments.length !== 0 && (
                        <Collapse accordion>
                            {appointments.map((appointment) => (
                                <ChildExpansionPanel key={appointment.id} appointment={appointment} />
                            ))}
                        </Collapse>
                    )}
                    {appointments === null && (
                        <Empty description="No enrolments" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
                </Card>
            </div>
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    root: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        width: '90%',
        height: 'fit-content',
        marginTop: 36,
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    },
})

export default withRouter(ClassDetailsPage)
