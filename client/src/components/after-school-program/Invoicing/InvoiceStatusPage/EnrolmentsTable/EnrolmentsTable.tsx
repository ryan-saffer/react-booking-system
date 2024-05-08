import { Button, Dropdown, MenuProps, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { AcuityTypes, AfterSchoolEnrolment, PriceWeekMap } from 'fizz-kidz'
import React, { useEffect, useMemo, useState } from 'react'

import { CheckCircleOutlined, CloseCircleOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import WithConfirmationDialog, { ConfirmationDialogProps } from '@components/Dialogs/ConfirmationDialog'
import useErrorDialog from '@components/Hooks/UseErrorDialog'
import { useConfirmWithCheckbox } from '@components/Hooks/confirmation-dialog-with-checkbox.tsx/use-confirmation-dialog-with-checkbox'
import { styled } from '@mui/material/styles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { trpc } from '@utils/trpc'

import EnrolmentDetails from './EnrolmentDetails'
import InvoiceStatusCell from './InvoiceStatusCell'

const PREFIX = 'EnrolmentsTable'

const classes = {
    actionBtn: `${PREFIX}-actionBtn`,
}

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
    enrolments: AfterSchoolEnrolment[]
    calendar: string
    appointmentTypes: AcuityTypes.Api.AppointmentType[]
    onAppointmentTypeChange: (id: number) => void
} & ConfirmationDialogProps

type TableData = {
    key: string
    enrolment: AfterSchoolEnrolment
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
function getAppointmentWeekRange(enrolments: AfterSchoolEnrolment[]) {
    const output: number[] = []
    enrolments.forEach((enrolment) => {
        const num = enrolment.appointments.length
        if (!output.includes(num)) {
            output.push(num)
        }
    })
    return output.sort()
}

const _EnrolmentsTable: React.FC<Props> = ({
    enrolments,
    calendar,
    appointmentTypes,
    onAppointmentTypeChange,
    showConfirmationDialog,
}) => {
    const [loading, setLoading] = useState(true)
    const [changingClass, setChangingClass] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
    // const [invoiceStatusMap, setInvoiceStatusMap] = useState<InvoiceStatusMap>({})
    const { ErrorModal, showError } = useErrorDialog()
    const confirm = useConfirmWithCheckbox()

    const {
        data: invoiceStatusMap,
        isLoading: isLoadingInvoices,
        isSuccess,
    } = trpc.stripe.retrieveInvoiceStatuses.useQuery(
        {
            appointmentIds: enrolments.map((it) => it.id),
        },
        { initialData: {} }
    )
    const sendInvoicesMutation = trpc.stripe.sendInvoices.useMutation()
    const sendContinuationEmailsMutation = trpc.afterSchoolProgram.sendTermContinuationEmails.useMutation()
    const unenrollMutation = trpc.afterSchoolProgram.unenrollFromAfterSchoolProgram.useMutation()
    const trpcUtils = trpc.useUtils()

    const handleExpand = (expanded: boolean, record: TableData) => {
        if (expanded) {
            setExpandedRowKeys([record.key])
        } else {
            setExpandedRowKeys([])
        }
    }

    useEffect(() => {
        setLoading(isLoadingInvoices)
    }, [isLoadingInvoices])

    const handleActionButtonClick: MenuProps['onClick'] = async (e) => {
        const key = e.key as MenuKey
        switch (key) {
            case 'send-invoice': {
                if (isSuccess) {
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
                }
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
            case 'unenroll': {
                const { confirmed, checked } = await confirm({
                    title: 'Are you sure?',
                    description:
                        'This will completely unenroll the selected children from the term. This cannot be undone.',
                    checkboxLabel: 'Send unenrolment confirmation email.',
                    confirmButton: 'Unenrol',
                })

                if (confirmed) {
                    setLoading(true)
                    try {
                        await unenrollMutation.mutateAsync({
                            appointmentIds: selectedRowKeys.map((it) => it.toString()),
                            sendConfirmationEmail: checked,
                        })
                    } catch {
                        showError({ message: 'There was an error unenrolling from the term.' })
                    }
                    setLoading(false)
                }
            }
        }
    }

    const sendInvoices = async (price: string) => {
        setLoading(true)
        try {
            const result = await sendInvoicesMutation.mutateAsync(
                selectedRowKeys.map((it) => ({ id: it.toString(), price }))
            )
            trpcUtils.stripe.retrieveInvoiceStatuses.setData(
                { appointmentIds: enrolments.map((it) => it.id) },
                (invoiceStatusMap) => ({ ...invoiceStatusMap, ...result })
            )
            setSelectedRowKeys([])
        } catch {
            showError({ message: 'Some invoices failed to send. Please go through them to see which ones failed!' })
        }
        setLoading(false)
    }

    const sendTermContinuationEmails = async () => {
        setLoading(true)
        try {
            const result = await sendContinuationEmailsMutation.mutateAsync({
                appointmentIds: selectedRowKeys.map((it) => it.toString()),
            })

            if (result.length !== selectedRowKeys.length) {
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

    const columns: ColumnsType<TableData> = useMemo(
        () => [
            {
                key: 'parentName',
                title: 'Parent Name',
                dataIndex: 'enrolment',
                render: (enrolment: AfterSchoolEnrolment) =>
                    `${enrolment.parent.firstName} ${enrolment.parent.lastName}`,
            },
            {
                key: 'numOfWeeksEnrolled',
                title: 'Weeks Enrolled',
                dataIndex: 'enrolment',
                filters: getAppointmentWeekRange(enrolments).map((it) => ({ text: `${it} Weeks`, value: it })),
                onFilter: (value, record: TableData) => {
                    return value === record.enrolment.appointments.length
                },
                render: (enrolment: AfterSchoolEnrolment) => <Tag>{enrolment.appointments.length} Weeks</Tag>,
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
                render: (enrolment: AfterSchoolEnrolment) => {
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
                render: (enrolment: AfterSchoolEnrolment) => {
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
                render: (enrolment: AfterSchoolEnrolment) => (
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
        <Root className="twp mt-4 px-4">
            <Table
                loading={changingClass}
                pagination={false}
                size="small"
                caption={
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <Select
                            onValueChange={(it) => {
                                setChangingClass(true)
                                setTimeout(() => setChangingClass(false), 300)
                                onAppointmentTypeChange(parseInt(it))
                            }}
                        >
                            <SelectTrigger className="w-full flex-grow text-center text-xl [&>span]:w-full">
                                <SelectValue className="w-full" placeholder={calendar} />
                            </SelectTrigger>
                            <SelectContent>
                                {appointmentTypes.map((type) => (
                                    <SelectItem className="text-md" value={`${type.id}`} key={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dropdown
                            placement="bottomRight"
                            menu={{ items: menu, onClick: handleActionButtonClick }}
                            trigger={['click']}
                            disabled={!hasSelected}
                        >
                            <Button className="h-10" loading={loading}>
                                <Space>
                                    Action
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                    </div>
                }
                rowSelection={rowSelection}
                dataSource={data}
                columns={columns}
                expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (columns) => {
                        return <EnrolmentDetails enrolment={columns.enrolment} invoiceStatusMap={invoiceStatusMap!} />
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
