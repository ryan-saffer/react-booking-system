import React from 'react'
import { makeStyles } from '@material-ui/core'
import { List, Result, Row, Typography } from 'antd'
import { ScienceAppointment } from 'fizz-kidz'
import useAcuityClient from '../../../Hooks/api/UseAcuityClient'
import useErrorDialog from '../../../Hooks/UseErrorDialog'
import Loader from '../../shared/Loader'
import AppointmentRow from './AppointmentRow'

type Props = {
    appointment: ScienceAppointment
}

const ClassManager: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles()

    const appointments = useAcuityClient('getAppointments', { ids: appointment.appointments })

    const { ErrorModal, showError } = useErrorDialog()

    switch (appointments.status) {
        case 'loading':
            return <Loader />
        case 'loaded':
            return (
                <>
                    <Row className={classes.row}>
                        <Typography.Text className={classes.heading}>
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
                    </Row>
                    <ErrorModal />
                </>
            )

        default: // error
            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle="There was an error retreiving your term details. Please try again later."
                />
            )
    }
}

const useStyles = makeStyles({
    row: {
        justifyContent: 'center',
    },
    heading: {
        width: 1000,
    },
    list: {
        marginTop: 12,
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
        width: 1000,
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
    },
})

export default ClassManager
