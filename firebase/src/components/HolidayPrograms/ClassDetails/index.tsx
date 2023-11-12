import { useMemo, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate, useSearchParams } from 'react-router-dom'

import ChildExpansionPanel from './ChildExpansionPanel'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import { AcuityUtilities, AcuityConstants, AcuityTypes } from 'fizz-kidz'

import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SkeletonRows from '../../Shared/SkeletonRows'
import useFetchAppointments from '../../Hooks/api/UseFetchAppointments'
import { Card, Collapse, Empty } from 'antd'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'
import { DateTime } from 'luxon'
import * as ROUTES from '../../../constants/routes'

const PREFIX = 'ClassDetailsPage'

const classes = {
    main: `${PREFIX}-main`,
    root: `${PREFIX}-root`,
    card: `${PREFIX}-card`,
}

const Root = styled('div')({
    [`&.${classes.main}`]: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    [`& .${classes.root}`]: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${classes.card}`]: {
        width: '90%',
        height: 'fit-content',
        marginTop: 36,
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    },
})

export const ClassDetailsPage = () => {
    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)

    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId')!)
    const calendarId = parseInt(searchParams.get('calendarId')!)
    const classId = parseInt(searchParams.get('classId')!)
    const classTime = decodeURIComponent(searchParams.get('classTime')!)

    const classDisplayable = useMemo(
        () =>
            DateTime.fromISO(classTime).toLocaleString({
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        [classTime]
    )

    const navigate = useNavigate()

    const sortByChildName = (a: AcuityTypes.Api.Appointment, b: AcuityTypes.Api.Appointment) => {
        const aName = AcuityUtilities.retrieveFormAndField(
            a,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        ) as string
        const bName = AcuityUtilities.retrieveFormAndField(
            b,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        ) as string
        return aName.toUpperCase() < bName.toUpperCase() ? -1 : aName > bName ? 1 : 0
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        classTime,
        sorter: sortByChildName,
    }) as AcuityTypes.Api.Appointment[]

    return (
        <Root className={classes.main}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar style={{ display: 'flex' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} size="large">
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
                        <img
                            src={Logo.default}
                            style={{ maxWidth: 100, cursor: 'pointer' }}
                            alt="fizz kidz logo"
                            onClick={() => navigate(ROUTES.LANDING)}
                        />
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
        </Root>
    )
}
