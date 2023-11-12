import { Button, Dropdown, MenuProps, Space, Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { InvoiceStatusMap, PriceWeekMap, ScienceEnrolment } from 'fizz-kidz'
import React, { useEffect, useMemo, useState } from 'react'

import { CheckCircleOutlined, CloseCircleOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import WithConfirmationDialog, { ConfirmationDialogProps } from '@components/Dialogs/ConfirmationDialog'
import useErrorDialog from '@components/Hooks/UseErrorDialog'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { styled } from '@mui/material/styles'
import { callFirebaseFunction } from '@utils/firebase/functions'

import EnrolmentDetails from './EnrolmentDetails'
import styles from './EnrolmentsTable.module.css'
import InvoiceStatusCell from './InvoiceStatusCell'

const PREFIX = 'EnrolmentsTable'

const classes = {
    actionBtn: `${PREFIX}-actionBtn`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.actionBtn}`]: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        top: 0,
        right: 32,
        height: 61,
    },
})

type Props = {
    enrolments: ScienceEnrolment[]
    calendar: string
} & ConfirmationDialogProps

type TableData = {
    key: string
    enrolment: ScienceEnrolment
}

type MenuKey = 'send-invoice' | 'send-enrolment-email' | 'unenroll'

const menu: { key: MenuKey; label: string }[] = [
    {
        key: 'send-invoice',
        label: 'Send Invoice',
    },
    {
        key: 'send-enrolment-email',
        label: 'Send Enrolment Email',
    },
    {
        key: 'unenroll',
        label: 'Unenroll From Term',
    },
]

/**
 * Loops through all appointments, and returns an array of all different number of appointments booked
 */
function getAppointmentWeekRange(enrolments: ScienceEnrolment[]) {
    const output: number[] = []
    enrolments.forEach((enrolment) => {
        const num = enrolment.appointments.length
        if (!output.includes(num)) {
            output.push(num)
        }
    })
    return output.sort()
}

const _EnrolmentsTable: React.FC<Props> = ({ enrolments, calendar, showConfirmationDialog }) => {
    const firebase = useFirebase()

    const [loading, setLoading] = useState(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
    const [invoiceStatusMap, setInvoiceStatusMap] = useState<InvoiceStatusMap>({})
    const { ErrorModal, showError } = useErrorDialog()

    const handleExpand = (expanded: boolean, record: TableData) => {
        if (expanded) {
            setExpandedRowKeys([record.key])
        } else {
            setExpandedRowKeys([])
        }
    }

    useEffect(() => {
        async function retrieveInvoiceStatuses() {
            const invoiceStatuses = await callFirebaseFunction(
                'retrieveInvoiceStatuses',
                firebase
            )({
                appointmentIds: enrolments.map((it) => it.id),
            })

            setInvoiceStatusMap(invoiceStatuses.data)
            setLoading(false)
        }
        retrieveInvoiceStatuses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleActionButtonClick: MenuProps['onClick'] = (e) => {
        const key = e.key as MenuKey
        switch (key) {
            case 'send-invoice': {
                // ensure no one selected has a paid invoice
                let includesPaidInvoice = false
                selectedRowKeys.forEach((key) => {
                    if (invoiceStatusMap[key as string].status === 'PAID') {
                        includesPaidInvoice = true
                    }
                })

                if (includesPaidInvoice) {
                    showError({
                        title: 'Invalid Selection',
                        message:
                            "You've selected someone who has already paid their invoice. Please unselect this person and try again.",
                    })
                    return
                }
                showConfirmationDialog({
                    dialogTitle: 'Send Invoices',
                    dialogContent: `Select the amount you'd like to invoice the selected parents. This will also void any existing invoices. If sending to many people, this could take a while! (Up to 3 minutes)`,
                    confirmationButtonText: 'Send Invoices',
                    listItems: {
                        title: 'Invoice Price',
                        items: Object.entries(PriceWeekMap).map(([key, value]) => ({
                            key,
                            value: `$${key} (${value} weeks)`,
                        })),
                    },
                    onConfirm: (selectedPrice) => sendInvoices(selectedPrice),
                })
                break
            }
            case 'send-enrolment-email':
                showConfirmationDialog({
                    dialogTitle: `Send term enrolment email to selected parents`,
                    dialogContent: `This will send an email asking selected parents if they would like to continue with the term or not.`,
                    confirmationButtonText: 'Send Email',
                    onConfirm: sendTermContinuationEmails,
                })
                break
            case 'unenroll':
                showConfirmationDialog({
                    dialogTitle: `Unenroll child from the term`,
                    dialogContent: `This will completely unenroll the selected children from the term. This cannot be undone.`,
                    confirmationButtonText: 'Unenroll from term',
                    onConfirm: unenrollFromTerm,
                })
        }
    }

    const sendInvoices = async (price: string) => {
        setLoading(true)
        try {
            const result = await callFirebaseFunction(
                'sendInvoices',
                firebase
            )(selectedRowKeys.map((it) => ({ id: it.toString(), price })))
            setInvoiceStatusMap((invoiceStatusMap) => ({ ...invoiceStatusMap, ...result.data }))
            setSelectedRowKeys([])
        } catch {
            showError({ message: 'Some invoices failed to send. Please go through them to see which ones failed!' })
        }
        setLoading(false)
    }

    const sendTermContinuationEmails = async () => {
        setLoading(true)
        try {
            const result = await callFirebaseFunction(
                'sendTermContinuationEmails',
                firebase
            )({ appointmentIds: selectedRowKeys.map((it) => it.toString()) })

            if (result.data.length !== selectedRowKeys.length) {
                showError({
                    message:
                        'Some of the emails were sent succesfully, but some failed. Please carefully review which did not send.',
                })
            }
        } catch {
            showError({ message: 'There was an error sending the emails' })
        }
        setLoading(false)
    }

    const unenrollFromTerm = async () => {
        setLoading(true)
        try {
            await callFirebaseFunction(
                'unenrollScienceAppointments',
                firebase
            )({ appointmentIds: selectedRowKeys.map((it) => it.toString()) })
        } catch {
            showError({ message: 'There was an error unenrolling from the term.' })
        }
        setLoading(false)
    }

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
                filters: getAppointmentWeekRange(enrolments).map((it) => ({ text: `${it} Weeks`, value: it })),
                onFilter: (value, record: TableData) => {
                    return value === record.enrolment.appointments.length
                },
                render: (enrolment: ScienceEnrolment) => <Tag>{enrolment.appointments.length} Weeks</Tag>,
            },
            {
                key: 'freeTrialEmailSent',
                title: 'Enrolment Email Sent',
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
        ],
        [enrolments, invoiceStatusMap]
    )

    const data = useMemo<TableData[]>(
        () => enrolments.map((enrolment) => ({ key: enrolment.id, enrolment })),
        [enrolments]
    )

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        // do not allow selected rows to change while loading.
        // selectedRowKeys is used to update ui such as removing someone on deletion.
        // this is the simplest and safest solution.
        if (!loading) {
            setSelectedRowKeys(newSelectedRowKeys)
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }
    const hasSelected = selectedRowKeys.length > 0

    return (
        <Root>
            <Table
                className={styles.table}
                bordered
                pagination={false}
                size="small"
                caption={
                    <>
                        <Typography.Title level={5} style={{ textAlign: 'center', margin: 9 }}>
                            {calendar}
                        </Typography.Title>
                        <Dropdown
                            placement="bottomRight"
                            menu={{ items: menu, onClick: handleActionButtonClick }}
                            trigger={['click']}
                        >
                            <div className={styles.actionButton}>
                                <Button loading={loading} disabled={!hasSelected}>
                                    <Space>
                                        Action
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </div>
                        </Dropdown>
                    </>
                }
                rowSelection={rowSelection}
                dataSource={data}
                columns={columns}
                expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (columns) => {
                        return <EnrolmentDetails enrolment={columns.enrolment} invoiceStatusMap={invoiceStatusMap} />
                    },
                    expandedRowKeys: expandedRowKeys,
                    onExpand: handleExpand,
                }}
            />
            <ErrorModal />
        </Root>
    )
}

export const EnrolmentsTable = WithConfirmationDialog(_EnrolmentsTable)
