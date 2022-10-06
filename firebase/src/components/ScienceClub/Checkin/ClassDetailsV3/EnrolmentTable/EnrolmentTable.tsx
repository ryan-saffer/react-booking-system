import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { Table, Tag, Typography } from 'antd'
import ChildDetails from './ChildDetails'
import useWindowDimensions from '../../../../Hooks/UseWindowDimensions'
import ActionButton from './ActionButton'
import { EnrolmentsMap, getEnrolment } from '..'
import { callAcuityClientV2, callFirebaseFunction } from '../../../../../utilities/firebase/functions'
import useFirebase from '../../../../Hooks/context/UseFirebase'

export const BREAKPOINT = 540

type Props = {
    appointments: Acuity.Appointment[]
    setAppointments: Dispatch<SetStateAction<Acuity.Appointment[]>>
    enrolmentsMap: EnrolmentsMap
    calendarName: string
    setEnrolmentsMap: Dispatch<SetStateAction<EnrolmentsMap>>
}

type TableData = {
    key: number
    acuityAppointment: Acuity.Appointment
    enrolment: ScienceEnrolment
}

export type SetAppointmentLabel = (id: number, label: 'signed-in' | 'signed-out' | 'not-attending' | 'none') => void

export type UpdateEnrolment = (enrolment: ScienceEnrolment, signOutInfo: ScienceEnrolment['signatures']) => void

const EnrolmentTable: React.FC<Props> = ({
    appointments,
    setAppointments,
    enrolmentsMap,
    calendarName,
    setEnrolmentsMap,
}) => {
    const firebase = useFirebase()
    const { width } = useWindowDimensions()

    const [expandedRows, setExpandedRows] = useState<number[]>([])

    const handleExpandRow = (expanded: boolean, record: TableData) => {
        if (expanded) {
            setExpandedRows([record.key])
        } else {
            setExpandedRows([])
        }
    }

    const setAppointmentLabel: SetAppointmentLabel = async (id: number, label: string) => {
        const result = await callAcuityClientV2(
            'updateAppointment',
            firebase
        )({
            id,
            labels:
                label === 'signed-in'
                    ? [{ id: Acuity.Constants.Labels.CHECKED_IN }]
                    : label === 'signed-out'
                    ? [{ id: Acuity.Constants.Labels.CHECKED_OUT }]
                    : label === 'not-attending'
                    ? [{ id: Acuity.Constants.Labels.NOT_ATTENDING }]
                    : [],
        })

        updateAppointment(result.data)
    }

    const updateEnrolment: UpdateEnrolment = async (
        enrolment: ScienceEnrolment,
        signOutInfo: ScienceEnrolment['signatures']
    ) => {
        const result = await callFirebaseFunction(
            'updateScienceEnrolment',
            firebase
        )({
            id: enrolment.id,
            signatures: {
                ...enrolment.signatures,
                ...signOutInfo,
            },
        })

        setEnrolmentsMap({
            ...enrolmentsMap,
            [result.data.id]: result.data,
        })
    }

    const updateAppointment = (newApt: Acuity.Appointment) => {
        setAppointments(
            appointments.map((existingApt) => {
                if (newApt.id === existingApt.id) {
                    return newApt
                }
                return existingApt
            })
        )
    }

    const columns: ColumnsType<TableData> = useMemo(() => {
        const cols: any = []
        cols.push({
            title: 'Child Name',
            dataIndex: 'enrolment',
            key: 'childName',
            render: (enrolment: ScienceEnrolment) => `${enrolment.child.firstName} ${enrolment.child.lastName}`,
        })

        if (width > BREAKPOINT) {
            cols.push({
                title: 'Child Age',
                dataIndex: 'enrolment',
                key: 'childAge',
                render: (enrolment: ScienceEnrolment) => enrolment.child.age,
            })
            cols.push({
                title: 'Child Grade',
                dataIndex: 'enrolment',
                key: 'childGrade',
                render: (enrolment: ScienceEnrolment) => {
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
            render: (appointment: Acuity.Appointment) => {
                const enrolment = getEnrolment(appointment, enrolmentsMap)
                const notAttending = appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.NOT_ATTENDING)
                if (notAttending) {
                    return <Tag color="red">NOT ATTENDING</Tag>
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
            render: (appointment: Acuity.Appointment) => {
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
            bordered
            pagination={false}
            size="small"
            title={() => (
                <Typography.Title level={5} style={{ textAlign: 'center' }}>
                    {calendarName}
                </Typography.Title>
            )}
            columns={columns}
            dataSource={data}
            expandedRowKeys={expandedRows}
            onExpand={handleExpandRow}
            expandable={{
                expandRowByClick: true,
                expandedRowRender: (columns) => {
                    const appointment = appointments.find((appointment) => appointment.id === columns.key)!!
                    const enrolment = getEnrolment(appointment, enrolmentsMap)
                    return (
                        <ChildDetails
                            enrolment={enrolment}
                            appointment={appointment}
                            setAppointmentLabel={setAppointmentLabel}
                        />
                    )
                },
            }}
        />
    )
}

export default EnrolmentTable