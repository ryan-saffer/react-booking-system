import { List, Result, Row, Typography } from 'antd'
import { AfterSchoolEnrolment } from 'fizz-kidz'
import React from 'react'

import useErrorDialog from '@components/Hooks/UseErrorDialog'
import { trpc } from '@utils/trpc'

import Loader from '../../../Shared/Loader'
import AppointmentRow from './AppointmentRow'
import styles from './ClassManager.module.css'

type Props = {
    appointment: AfterSchoolEnrolment
}

const ClassManager: React.FC<Props> = ({ appointment }) => {
    const {
        isLoading,
        isError,
        data: appointments,
    } = trpc.acuity.getAppointments.useQuery({ ids: appointment.appointments })

    const { ErrorModal, showError } = useErrorDialog()

    if (isLoading) {
        return <Loader />
    }

    if (isError) {
        return (
            <Result
                status="error"
                title="Something went wrong"
                subTitle="There was an error retreiving your term details. Please try again later."
            />
        )
    }

    if (appointments) {
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
                        dataSource={appointments.map((it) => (
                            <AppointmentRow key={it.id} appointment={it} showError={showError} />
                        ))}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                    />
                </Row>
                <ErrorModal />
            </>
        )
    }
}

export default ClassManager
