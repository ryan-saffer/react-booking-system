import { styled } from '@mui/material/styles'
import { Button, Descriptions, Table, Tag } from 'antd'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

import type { Employee } from 'fizz-kidz'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useOrg } from '@components/Session/use-org'
import Loader from '@components/Shared/Loader'


import { DeleteEmployeeButton } from './delete-employee-button'
import EmployeeVerificationButton from './employee-verification-button'
import { EmployeeWWCCButton } from './employee-wwcc-button'

import type { ColumnsType } from 'antd/es/table'

const PREFIX = 'EmployeeTable'

const classes = {
    details: `${PREFIX}-details`,
}

const StyledDescriptions = styled(Descriptions)({
    [`&.${classes.details}`]: {
        '& th': {
            width: '25%',
            '& span': {
                fontWeight: 700,
            },
        },
    },
})

const useEmployees = () => {
    const firebase = useFirebase()

    const { currentOrg } = useOrg()

    const [loading, setLoading] = useState(true)
    const [employees, setEmployees] = useState<Employee[]>([])

    useEffect(() => {
        setLoading(true)
        const employeesQuery = query(collection(firebase.db, 'employees'), orderBy('created', 'desc'))
        const unsubscribe = onSnapshot(employeesQuery, (snap) => {
            setEmployees(snap.docs.map((doc) => doc.data() as Employee).filter((it) => it.studio === currentOrg))
            setLoading(false)
        })

        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentOrg])

    return { employees, loading }
}

const EmployeeTable = () => {
    const { employees, loading } = useEmployees()
    const [expandedRows, setExpandedRows] = useState<string[]>([])

    const renderBadge = (status: Employee['status']) => {
        switch (status) {
            case 'form-sent':
                return <Tag color="orange">Form Sent</Tag>
            case 'generating-accounts':
                return <Tag color="volcano">Uploading Files</Tag>
            case 'verification':
                return <Tag color="blue">Requires Verification</Tag>
            case 'complete':
                return <Tag color="green">Onboarding Complete</Tag>
            default: {
                const exhaustive: never = status
                console.error(`unknown employee status: '${exhaustive}`)
            }
        }
    }

    const columns: ColumnsType<Employee> = [
        {
            key: 'created',
            title: 'Created',
            render: (employee: Employee) => new Date(employee.created).toLocaleDateString(),
            sorter: {
                compare: (first, second) => first.created - second.created,
                multiple: 3,
            },
        },
        {
            key: 'firstName',
            dataIndex: 'firstName',
            title: 'First Name',
            sorter: {
                compare: (first, second) => first.firstName.localeCompare(second.firstName),
                multiple: 1,
            },
        },
        {
            key: 'lastName',
            dataIndex: 'lastName',
            title: 'Last Name',
        },
        {
            key: 'contract',
            title: 'Contract Status',
            render: (employee: Employee) => (
                <Tag color={employee.contract.signed ? 'green' : 'orange'}>
                    {employee.contract.signed ? 'Signed' : 'Awaiting Signature'}
                </Tag>
            ),
        },
        {
            key: 'wwcc',
            title: 'WWCC Status',
            render: (employee: Employee) => {
                if (employee.status === 'form-sent') {
                    return <Tag color="red">Not provided</Tag>
                } else {
                    return (
                        <Tag color={employee.wwcc.status === 'I have a WWCC' ? 'green' : 'orange'}>
                            {employee.wwcc.status === 'I have a WWCC' ? 'Provided' : 'Applied'}
                        </Tag>
                    )
                }
            },
        },
        {
            key: 'status',
            title: 'Onboarding Status',
            render: (employee: Employee) => renderBadge(employee.status),
            sorter: {
                compare: (first, second) => first.status.localeCompare(second.status),
                multiple: 2,
            },
        },
        {
            key: 'action',
            title: 'Actions',
            render: (employee: Employee) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <DeleteEmployeeButton employee={employee} />
                    {employee.status === 'verification' && <EmployeeVerificationButton employee={employee} />}
                    {employee.status !== 'form-sent' &&
                        employee.wwcc.status === 'I have applied for a WWCC and have an application number' && (
                            <EmployeeWWCCButton employee={employee} />
                        )}
                </div>
            ),
        },
    ]

    if (loading) return <Loader style={{ marginTop: '4rem' }} />

    return (
        <Table
            columns={columns}
            dataSource={employees.map((employee) => ({ ...employee, key: employee.id }))}
            size="small"
            pagination={{
                pageSize: 50,
            }}
            expandable={{
                expandRowByClick: true,
                expandedRowRender: (employee) => {
                    return <EmployeeDetails employee={employee} />
                },
                expandedRowKeys: expandedRows,
                onExpand: (expanded, employee) => {
                    setExpandedRows(expanded ? [employee.id] : [])
                },
            }}
        />
    )
}

const EmployeeDetails: React.FC<{ employee: Employee }> = ({ employee }) => {
    const hasFilledInForm = employee.status !== 'form-sent'

    return (
        <StyledDescriptions bordered size="small" column={1} className={classes.details}>
            <Descriptions.Item label="First Name">{employee.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{employee.lastName}</Descriptions.Item>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{employee.mobile}</Descriptions.Item>
            {hasFilledInForm && (
                <>
                    <Descriptions.Item label="Pronouns">{employee.pronouns}</Descriptions.Item>
                    <Descriptions.Item label="DOB">{employee.dob}</Descriptions.Item>
                    <Descriptions.Item label="Address">{employee.address.full}</Descriptions.Item>
                </>
            )}
            <Descriptions.Item label="Manager">{employee.managerName}</Descriptions.Item>
            <Descriptions.Item label="Contract">
                <Button href={`https://esignatures.io/contracts/${employee.contract.id}`} target="_none">
                    View Contract
                </Button>
            </Descriptions.Item>
        </StyledDescriptions>
    )
}

export default EmployeeTable
