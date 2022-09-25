import { makeStyles } from '@material-ui/core'
import { List, Typography } from 'antd'
import { Acuity, ScienceAppointment, Service } from 'fizz-kidz'
import React, { useContext, useEffect, useState } from 'react'
import { callAcuityClientV2 } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import useErrorDialog from '../../../Hooks/UseErrorDialog'
import Loader from '../Loader'
import AppointmentRow from './AppointmentRow'

type Props = {
    appointment: ScienceAppointment
}

const ClassManager: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles()
    const firebase = useContext(FirebaseContext) as Firebase

    const [appointments, setAppointments] = useState<Service<Acuity.Appointment[]>>({ status: 'loading' })
    const { ErrorModal, showError } = useErrorDialog()

    useEffect(() => {
        callAcuityClientV2(
            'getAppointments',
            firebase
        )({ ids: appointment.appointments })
            .then((result) => setAppointments({ status: 'loaded', result: result.data }))
            .catch((error) => setAppointments({ status: 'error', error }))
    }, [appointment])

    switch (appointments.status) {
        case 'loading':
            return <Loader />
        case 'loaded':
            return (
                <>
                    <Typography.Text>
                        If {appointment.childFirstName} cannot attend on a given week, let us know by simply
                        toggling off that week.
                    </Typography.Text>
                    <List
                        className={classes.list}
                        size="large"
                        header={
                            <div className={classes.listHeader}>
                                <Typography.Text strong>Date</Typography.Text>
                                <Typography.Text strong>Attending</Typography.Text>
                            </div>
                        }
                        bordered
                        dataSource={appointments.result.map((it) => (
                            <AppointmentRow key={it.id} appointment={it} showError={showError} />
                        ))}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                    />
                    <ErrorModal />
                </>
            )

        default: // error
            // TODO
            return <h1>ERROR</h1>
    }
}

const useStyles = makeStyles({
    list: {
        marginTop: 12,
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
    },
})

export default ClassManager
