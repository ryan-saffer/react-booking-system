import React, { useEffect, useMemo, useState } from 'react'
import { FunctionsResult, InvoiceStatus, ScienceEnrolment } from 'fizz-kidz'
import { Button, Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { CloseCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import InvoiceStatusCell from './InvoiceStatusCell'
import { callFirebaseFunction } from '../../../../../utilities/firebase/functions'
import useFirebase from '../../../../Hooks/context/UseFirebase'
import EnrolmentDetails from './EnrolmentDetails'

type Props = {
    enrolments: ScienceEnrolment[]
    calendar: string
}

type TableData = {
    key: string
    enrolment: ScienceEnrolment
}

export type InvoiceStatusMap = { [key: string]: InvoiceStatus }

const EnrolmentsTable: React.FC<Props> = ({ enrolments, calendar }) => {
    const firebase = useFirebase()
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
    const [invoiceStatusMap, setInvoiceStatusMap] = useState<InvoiceStatusMap>({})

    const handleExpand = (expanded: boolean, record: TableData) => {
        if (expanded) {
            setExpandedRowKeys([record.key])
        } else {
            setExpandedRowKeys([])
        }
    }

    useEffect(() => {
        async function retrieveInvoiceStatuses() {
            const invoiceStatusesArray = await Promise.all(
                enrolments.map((enrolment) =>
                    callFirebaseFunction('retrieveInvoiceStatusV2', firebase)({ appointmentId: enrolment.id })
                )
            )
            const invoiceStatuses: InvoiceStatusMap = {}
            enrolments.forEach((value, index) => (invoiceStatuses[value.id] = invoiceStatusesArray[index].data))

            setInvoiceStatusMap(invoiceStatuses)
        }
        retrieveInvoiceStatuses()
    }, [])

    const columns: ColumnsType<TableData> = useMemo(
        () => [
            {
                key: 'parentName',
                title: 'Parent Name',
                dataIndex: 'enrolment',
                render: (enrolment: ScienceEnrolment) => `${enrolment.parent.firstName} ${enrolment.parent.lastName}`,
            },
            {
                key: 'numOfWeeksEnrolled',
                title: 'Weeks Enrolled',
                dataIndex: 'enrolment',
                render: (enrolment: ScienceEnrolment) => <Tag>{enrolment.appointments.length} Weeks</Tag>,
            },
            {
                key: 'freeTrialEmailSent',
                title: 'Free Trial Email Sent',
                dataIndex: 'enrolment',
                filters: [
                    {
                        text: 'YES',
                        value: 'YES',
                    },
                    {
                        text: 'NO',
                        value: 'NO',
                    },
                ],
                onFilter: (value, record: TableData) => {
                    if (value === 'YES') return record.enrolment.emails.continuingEmailSent
                    if (value === 'NO') return !record.enrolment.emails.continuingEmailSent
                    return false
                },
                render: (enrolment: ScienceEnrolment) => {
                    let colour = 'red'
                    let status = 'NO'
                    if (enrolment.emails.continuingEmailSent) {
                        colour = 'green'
                        status = 'YES'
                    }
                    return <Tag color={colour}>{status}</Tag>
                },
            },
            {
                key: 'continuing',
                title: 'Continuing?',
                dataIndex: 'enrolment',
                filters: [
                    {
                        text: 'UNKNOWN',
                        value: 'UNKNOWN',
                    },
                    {
                        text: 'YES',
                        value: 'YES',
                    },
                    {
                        text: 'NO',
                        value: 'NO',
                    },
                ],
                onFilter: (value, record: TableData) => {
                    const continuing = record.enrolment.continuingWithTerm
                    if (value === 'UNKNOWN') return continuing === ''
                    if (value === 'YES') return continuing === 'yes'
                    if (value === 'NO') return continuing === 'no'
                    return true
                },
                render: (enrolment: ScienceEnrolment) => {
                    let colour = 'orange'
                    let status = 'UNKNOWN'
                    switch (enrolment.continuingWithTerm) {
                        case 'yes':
                            colour = 'success'
                            status = 'YES'
                            break
                        case 'no':
                            colour = 'error'
                            status = 'NO'
                            break
                    }
                    return (
                        <Tag
                            color={colour}
                            icon={
                                status === 'YES' ? (
                                    <CheckCircleOutlined />
                                ) : status === 'NO' ? (
                                    <CloseCircleOutlined />
                                ) : (
                                    <ExclamationCircleOutlined />
                                )
                            }
                        >
                            {status}
                        </Tag>
                    )
                },
            },
            {
                key: 'invoiceStatus',
                dataIndex: 'enrolment',
                title: 'Invoice Status',
                filters: [
                    {
                        text: 'NOT SENT',
                        value: 'NOT_SENT',
                    },
                    {
                        text: 'PAID',
                        value: 'PAID',
                    },
                    {
                        text: 'UNPAID',
                        value: 'UNPAID',
                    },
                ],
                onFilter: (value, record: TableData) => {
                    const status = invoiceStatusMap[record.enrolment.id].status
                    return status === value
                },
                render: (enrolment: ScienceEnrolment) => (
                    <InvoiceStatusCell enrolment={enrolment} invoiceStatusMap={invoiceStatusMap} />
                ),
            },
            {
                key: 'invoiceStatus',
                dataIndex: 'enrolment',
                title: 'Invoice',
                render: (enrolment: ScienceEnrolment) => {
                    const status = invoiceStatusMap[enrolment.id]
                    if (status && (status.status === 'PAID' || status.status === 'UNPAID')) {
                        return (
                            <Button href={status.dashboardUrl} target="_blank" onClick={(e) => e.stopPropagation()}>
                                View Invoice
                            </Button>
                        )
                    }
                },
            },
        ],
        [enrolments, invoiceStatusMap]
    )

    const data = useMemo<TableData[]>(
        () => enrolments.map((enrolment) => ({ key: enrolment.id, enrolment })),
        [enrolments, invoiceStatusMap]
    )

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }
    const hasSelected = selectedRowKeys.length > 0

    return (
        <Table
            bordered
            pagination={false}
            size="small"
            title={() => (
                <>
                    <Typography.Title level={5} style={{ textAlign: 'center' }}>
                        {calendar}
                    </Typography.Title>
                    <Button style={{ position: 'absolute' }}>Actions</Button>
                </>
            )}
            rowSelection={rowSelection}
            expandedRowKeys={expandedRowKeys}
            onExpand={handleExpand}
            dataSource={data}
            columns={columns}
            expandable={{
                expandRowByClick: true,
                expandedRowRender: (columns) => {
                    return <EnrolmentDetails enrolment={columns.enrolment} />
                },
            }}
        />
    )
}

export default EnrolmentsTable
