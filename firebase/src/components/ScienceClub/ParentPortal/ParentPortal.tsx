import { makeStyles } from '@material-ui/core'
import { Card, Col, Divider, Row, Typography } from 'antd'
import { ScienceAppointment, Service } from 'fizz-kidz'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Firebase, { FirebaseContext } from '../../Firebase'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import ClassManager from './ClassManager/ClassManager'
import InvoiceDetails from './InvoiveDetails/InvoiceDetails'
import Loader from './Loader'
import PickupPeople from './PickupPeople/PickupPeople'

const BREAK_LARGE = 990
const BREAK_SMALL = 515

type Params = {
    id: string
}

const ParentPortal: React.FC = () => {
    const classes = useStyles()
    const firebase = useContext(FirebaseContext) as Firebase

    const { id } = useParams<Params>()

    const { width } = useWindowDimensions()

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
                    <Row justify="space-between" gutter={[32, 12]} style={{ marginTop: 24 }}>
                        <Col span={width > BREAK_LARGE ? 9 : 24}>
                            <Card className={classes.card} title="🧪 Program" hoverable>
                                <p>{service.result.className}</p>
                            </Card>
                        </Col>
                        <Col span={width > BREAK_LARGE ? 9 : width > BREAK_SMALL ? 12 : 24}>
                            <Card className={classes.card} title="👩‍🔬 Child Enrolled">
                                <p>
                                    {service.result.childFirstName} {service.result.childLastName}
                                </p>
                            </Card>
                        </Col>
                        <Col span={width > BREAK_LARGE ? 6 : width > BREAK_SMALL ? 12 : 24}>
                            <InvoiceDetails appointment={service.result} />
                        </Col>
                    </Row>
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
    },
    card: {
        height: '100%',
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
})

export default ParentPortal
