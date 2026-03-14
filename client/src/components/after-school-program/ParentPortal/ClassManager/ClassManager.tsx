import { useQuery } from '@tanstack/react-query'
import { List, Result, Typography } from 'antd'
import React from 'react'

import type { AfterSchoolEnrolment } from 'fizz-kidz'

import useErrorDialog from '@components/Hooks/UseErrorDialog'
import { useTRPC } from '@utils/trpc'

import AppointmentRow from './AppointmentRow'
import styles from './ClassManager.module.css'
import Loader from '../../../Shared/Loader'

type Props = {
    appointment: AfterSchoolEnrolment
}

const ClassManager: React.FC<Props> = ({ appointment }) => {
    const trpc = useTRPC()
    const {
        isPending,
        isError,
        data: appointments,
    } = useQuery(trpc.acuity.getAppointments.queryOptions({ ids: appointment.appointments }))

    const { ErrorModal, showError } = useErrorDialog()

    if (isPending) {
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
                <div className="flex flex-col items-center justify-center">
                    <Typography.Text className="text-center">
                        If {appointment.child.firstName} cannot attend on a given week,{' '}
                        <strong>let us know by toggling off that week.</strong> Otherwise, we will search for{' '}
                        {appointment.child.firstName} far and wide!
                    </Typography.Text>
                    <Typography.Text className="mt-4 text-center" italic>
                        ℹ️ Please note, we do not offer credits or refunds for missed weeks.
                    </Typography.Text>
                    <List
                        className="mt-4 w-full max-w-[1000px] border-none shadow-[0px_7px_29px_0px_rgba(100,100,111,0.15)]"
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
                </div>
                <ErrorModal />
            </>
        )
    }
}

export default ClassManager
