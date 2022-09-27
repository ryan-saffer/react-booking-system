import { makeStyles } from '@material-ui/core'
import { Card, Col, Divider, Row, Typography } from 'antd'
import { ScienceAppointment, Service } from 'fizz-kidz'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Firebase, { FirebaseContext } from '../../Firebase'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import ClassManager from './ClassManager/ClassManager'
import EnrolmentSummary from './EnrolmentSummary/EnrolmentSummary'
import InvoiceDetails from './InvoiveDetails/InvoiceDetails'
import Loader from './Loader'
import PickupPeople from './PickupPeople/PickupPeople'

type Params = {
    id: string
}

const ParentPortal: React.FC = () => {
    const classes = useStyles()
    const firebase = useContext(FirebaseContext) as Firebase

    const { id } = useParams<Params>()

    const [service, setService] = useState<Service<ScienceAppointment>>({ status: 'loading' })

    useEffect(() => {
        firebase.db
            .doc(`scienceAppointments/${id}`)
            .get()
            .then((result) => {
                if (result.exists) {
                    setService({ status: 'loaded', result: result.data() as ScienceAppointment })
                } else {
                    setService({ status: 'error', error: 'appointment not found' })
                }
            })
            .catch((error) => setService({ status: 'error', error }))
    }, [])

    switch (service.status) {
        case 'loading':
            return <Loader />

        case 'loaded':
            return (
                <div className={classes.root}>
                    <Typography.Title level={2}>Hi {service.result.parentFirstName} 👋</Typography.Title>
                    <Typography.Text strong>
                        Use this portal to manage your Fizz Kidz science program enrolment.
                    </Typography.Text>
                    <Divider>Enrolment Details</Divider>
                    <EnrolmentSummary appointment={service.result} />
                    <Divider>Manage Attendance</Divider>
                    <ClassManager appointment={service.result} />
                    <Divider>Manage Pickup People</Divider>
                    <PickupPeople appointment={service.result} />
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
    }
})

export default ParentPortal
