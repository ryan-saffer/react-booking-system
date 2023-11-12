import { List, Result, Row, Typography } from 'antd'
import { ScienceEnrolment } from 'fizz-kidz'
import React from 'react'

import useErrorDialog from '@components/Hooks/UseErrorDialog'
import useAcuityClient from '@components/Hooks/api/UseAcuityClient'

import Loader from '../../shared/Loader'
import AppointmentRow from './AppointmentRow'
import styles from './ClassManager.module.css'

type Props = {
    appointment: ScienceEnrolment
}

const ClassManager: React.FC<Props> = ({ appointment }) => {
    const appointments = useAcuityClient('getAppointments', { ids: appointment.appointments })

    const { ErrorModal, showError } = useErrorDialog()

    switch (appointments.status) {
        case 'loading':
            return <Loader />
        case 'loaded':
            return (
                <>
                    <Row className={styles.row}>
                        <Typography.Text className={styles.heading}>
                            If {appointment.child.firstName} cannot attend on a given week,{' '}
                            <strong>let us know by toggling off that week.</strong> Otherwise, we will search for{' '}
                            {appointment.child.firstName} far and wide!
                        </Typography.Text>
                        <Typography.Text style={{ marginTop: 12 }} className={styles.heading} italic>
                            ℹ️ Please note, we do not offer credits or refunds for missed weeks.
                        </Typography.Text>
                        <List
                            className={styles.list}
                            size="large"
                            header={
                                <div className={styles.listHeader}>
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

export default ClassManager
