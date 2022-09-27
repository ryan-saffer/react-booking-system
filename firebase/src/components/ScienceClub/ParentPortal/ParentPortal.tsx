import React from 'react'
import { makeStyles } from '@material-ui/core'
import { Divider, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useFetchScienceAppointment from '../../Hooks/api/UseFetchScienceAppointment'
import ClassManager from './ClassManager/ClassManager'
import EnrolmentSummary from './EnrolmentSummary/EnrolmentSummary'
import Loader from './Loader'
import PickupPeople from './PickupPeople/PickupPeople'

type Params = {
    id: string
}

const ParentPortal: React.FC = () => {
    const classes = useStyles()

    const { id } = useParams<Params>()

    const service = useFetchScienceAppointment(id)

    switch (service.status) {
        case 'loading':
            return <Loader />

        case 'loaded':
            const appointment = service.result
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
            // TODO
            return <h1>ERROR</h1>
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
})

export default ParentPortal
