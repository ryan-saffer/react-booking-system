import React from 'react'
import { makeStyles } from '@material-ui/core'
import { Divider, Result, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useFetchScienceAppointment from '../../Hooks/api/UseFetchScienceAppointment'
import ClassManager from './ClassManager/ClassManager'
import EnrolmentSummary from './EnrolmentSummary/EnrolmentSummary'
import Loader from '../shared/Loader'
import PickupPeople from './PickupPeople/PickupPeople'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import useFirebase from '../../Hooks/context/UseFirebase'
import { MixpanelEvents } from '../../Mixpanel/Events'

type Params = {
    id: string
}

const ParentPortal: React.FC = () => {
    const classes = useStyles()

    const { id } = useParams<Params>()
    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const service = useFetchScienceAppointment(id)

    switch (service.status) {
        case 'loading':
            return <Loader />

        case 'loaded':
            const appointment = service.result
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_VIEW, {
                // to know if its us or the parent viewing their portal
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.parentEmail,
                appointment_id: appointment.id,
            })
            return (
                <div className={classes.root}>
                    <Typography.Title level={2}>Hi {appointment.parentFirstName} 👋</Typography.Title>
                    <Typography.Text strong>
                        Use this portal to manage your Fizz Kidz science program enrolment.
                    </Typography.Text>
                    <Divider>Enrolment Details</Divider>
                    <EnrolmentSummary appointment={appointment} />
                    <Divider>Manage Attendance</Divider>
                    <ClassManager appointment={appointment} />
                    <Divider>Manage Pickup People</Divider>
                    <PickupPeople appointment={appointment} />
                </div>
            )

        default: // error
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_ERROR_LOADING, {
                appointment_id: id,
            })
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

const useStyles = makeStyles({
    root: {
        width: 'auto',
        marginTop: 24,
        '@media(min-width: 550px)': {
            marginLeft: 24,
            marginRight: 24,
        },
    },
    summaryInvoice: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    error: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default ParentPortal
