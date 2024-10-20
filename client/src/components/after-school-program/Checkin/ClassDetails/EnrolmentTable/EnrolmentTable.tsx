import { Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { AcuityConstants, AcuityTypes, AfterSchoolEnrolment } from 'fizz-kidz'
import React, { useMemo, useState } from 'react'

import useWindowDimensions from '@components/Hooks/UseWindowDimensions'
import { trpc } from '@utils/trpc'

import { getEnrolment } from '../ClassDetails.utils'
import ActionButton from './ActionButton'
import ChildDetails from './ChildDetails'
import styles from './EnrolmentTable.module.css'
import { EnrolmentsMap } from '..'

export const BREAKPOINT_MD = 420
export const BREAKPOINT_LG = 540

type Props = {
    appointments: AcuityTypes.Api.Appointment[]
    updateAppointment: (appointment: AcuityTypes.Api.Appointment) => void
    enrolmentsMap: EnrolmentsMap
    calendarName: string
}

type TableData = {
    key: number
    acuityAppointment: AcuityTypes.Api.Appointment
    enrolment: AfterSchoolEnrolment
}

export type SetAppointmentLabel = (id: number, label: 'signed-in' | 'signed-out' | 'not-attending' | 'none') => void

export type UpdateEnrolment = (id: string, enrolment: Partial<AfterSchoolEnrolment>) => void

const EnrolmentTable: React.FC<Props> = ({ appointments, updateAppointment, enrolmentsMap, calendarName }) => {
    const { width } = useWindowDimensions()

    const [expandedRows, setExpandedRows] = useState<number[]>([])

    const updateAppointmentMutation = trpc.acuity.updateAppointment.useMutation()
    const updateEnrolmentMutation = trpc.afterSchoolProgram.updateAfterSchoolEnrolment.useMutation()

    const handleExpandRow = (expanded: boolean, record: TableData) => {
        if (expanded) {
            setExpandedRows([record.key])
        } else {
            setExpandedRows([])
        }
    }

    const setAppointmentLabel: SetAppointmentLabel = async (id, label) => {
        const result = await updateAppointmentMutation.mutateAsync({
            id,
            labels:
                label === 'signed-in'
                    ? [{ id: AcuityConstants.Labels.CHECKED_IN }]
                    : label === 'signed-out'
                      ? [{ id: AcuityConstants.Labels.CHECKED_OUT }]
                      : label === 'not-attending'
                        ? [{ id: AcuityConstants.Labels.NOT_ATTENDING }]
                        : [],
        })

        updateAppointment(result)
    }

    const updateEnrolment: UpdateEnrolment = async (id, enrolment) => {
        await updateEnrolmentMutation.mutateAsync({ id, ...enrolment })
    }

    const columns = useMemo(() => {
        const cols: ColumnsType<TableData> = []
        cols.push({
            title: 'Child Name',
            dataIndex: 'acuityAppointment',
            key: 'childName',
            render: (appointment: AcuityTypes.Api.Appointment) => {
                const enrolment = getEnrolment(appointment, enrolmentsMap)
                const name = `${enrolment.child.firstName} ${enrolment.child.lastName}`
                const notAttending = appointment.labels?.find((it) => it.id === AcuityConstants.Labels.NOT_ATTENDING)
                if (notAttending || enrolment.continuingWithTerm === 'no') {
                    return <del>{name}</del>
                } else {
                    return name
                }
            },
        })

        if (width > BREAKPOINT_LG) {
            cols.push({
                title: 'Child Age',
                dataIndex: 'enrolment',
                key: 'childAge',
                render: (enrolment: AfterSchoolEnrolment) => enrolment.child.age,
            })
            cols.push({
                title: 'Child Grade',
                dataIndex: 'enrolment',
                key: 'childGrade',
                render: (enrolment: AfterSchoolEnrolment) => {
                    let colour = ''
                    if (enrolment.child.grade === 'Prep') {
                        colour = 'green'
                    }
                    return <Tag color={colour}>{enrolment.child.grade.toUpperCase()}</Tag>
                },
            })
        }

        cols.push({
            title: 'Tags',
            dataIndex: 'acuityAppointment',
            key: 'tags',
            render: (appointment: AcuityTypes.Api.Appointment) => {
                const enrolment = getEnrolment(appointment, enrolmentsMap)
                const notAttending = appointment.labels?.find((it) => it.id === AcuityConstants.Labels.NOT_ATTENDING)
                if (enrolment.continuingWithTerm === 'no') {
                    return <Tag color="volcano">NOT CONTINUING</Tag>
                }
                if (notAttending) {
                    return <Tag color="purple">NOT ATTENDING</Tag>
                }
                return (
                    <span>
                        {enrolment.child.allergies && <Tag color="blue">ALLERGIES</Tag>}
                        {enrolment.child.isAnaphylactic && <Tag color="red">ANAPHYLACTIC</Tag>}
                        {!enrolment.child.permissionToPhotograph && <Tag color="orange">DO NOT PHOTOGRAPH</Tag>}
                    </span>
                )
            },
        })
        cols.push({
            title: 'Action',
            dataIndex: 'acuityAppointment',
            key: 'status',
            render: (appointment: AcuityTypes.Api.Appointment) => {
                const enrolment = getEnrolment(appointment, enrolmentsMap)
                return (
                    <ActionButton
                        appointment={appointment}
                        enrolment={enrolment}
                        updateEnrolment={updateEnrolment}
                        setAppointmentLabel={setAppointmentLabel}
                    />
                )
            },
        })
        return cols
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointments, width])

    const data = useMemo<TableData[]>(
        () =>
            appointments.map((appointment) => ({
                key: appointment.id,
                acuityAppointment: appointment,
                enrolment: getEnrolment(appointment, enrolmentsMap),
            })),
        [appointments, enrolmentsMap]
    )

    return (
        <Table
            className={styles.table}
            bordered
            pagination={false}
            size="small"
            caption={
                <Typography.Title level={5} style={{ textAlign: 'center', margin: '9px 0' }}>
                    {calendarName}
                </Typography.Title>
            }
            columns={columns}
            dataSource={data}
            expandable={{
                expandRowByClick: true,
                expandedRowKeys: expandedRows,
                onExpand: handleExpandRow,
                expandedRowRender: (columns) => {
                    const appointment = appointments.find((appointment) => appointment.id === columns.key)!
                    const enrolment = getEnrolment(appointment, enrolmentsMap)
                    return (
                        <ChildDetails
                            enrolment={enrolment}
                            appointment={appointment}
                            setAppointmentLabel={setAppointmentLabel}
                            updateEnrolment={updateEnrolment}
                        />
                    )
                },
            }}
        />
    )
}

export default EnrolmentTable
