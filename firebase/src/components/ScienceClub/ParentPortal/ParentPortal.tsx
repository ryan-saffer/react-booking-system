import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { Divider, Result, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useFetchScienceAppointment from '../../Hooks/api/UseFetchScienceAppointment'
import ClassManager from './ClassManager/ClassManager'
import EnrolmentSummary from './EnrolmentSummary/EnrolmentSummary'
import Loader from '../shared/Loader'
import PickupPeople from './PickupPeople/PickupPeople'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import useFirebase from '../../Hooks/context/UseFirebase'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import { MixpanelEvents } from '../../Mixpanel/Events'

const PREFIX = 'ParentPortal'

const classes = {
    root: `${PREFIX}-root`,
    summaryInvoice: `${PREFIX}-summaryInvoice`,
    error: `${PREFIX}-error`,
}

const Root = styled('div')({
    [`&.${classes.root}`]: {
        width: 'auto',
        marginTop: 24,
        '@media(min-width: 550px)': {
            marginLeft: 24,
            marginRight: 24,
        },
    },
    [`& .${classes.summaryInvoice}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    [`& .${classes.error}`]: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

type Params = {
    id: string
}

const ParentPortal: React.FC = () => {
    const { id } = useParams<Params>()
    const firebase = useFirebase()
    const mixpanel = useMixpanel()
    const { width } = useWindowDimensions()

    const service = useFetchScienceAppointment(id!)

    useEffect(() => {
        if (service.status === 'loaded') {
            const appointment = service.result
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_VIEW, {
                // to know if its us or the parent viewing their portal
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.parent.email,
                appointment: appointment.className,
            })
        }
        if (service.status === 'error') {
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_ERROR_LOADING, {
                appointment_id: id,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service.status])

    switch (service.status) {
        case 'loading':
            return <Loader />

        case 'loaded': {
            const appointment = service.result
            return (
                <Root className={classes.root}>
                    <Typography.Title level={width > 450 ? 2 : 3}>
                        Hi {appointment.parent.firstName} 👋
                    </Typography.Title>
                    <Typography.Text strong>
                        Use this portal to manage your Fizz Kidz science program enrolment.
                    </Typography.Text>
                    <Divider>Enrolment Details</Divider>
                    <EnrolmentSummary appointment={appointment} />
                    <Divider>Manage Attendance</Divider>
                    <ClassManager appointment={appointment} />
                    <Divider>Manage Pickup People</Divider>
                    <PickupPeople appointment={appointment} />
                </Root>
            )
        }
        default: // error
            return (
                <div className={classes.error}>
                    <Result
                        status="500"
                        title="Oh no.."
                        subTitle="Sorry, something went wrong. Please try again later."
                    />
                </div>
            )
    }
}

export default ParentPortal
