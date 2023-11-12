import { Button, Descriptions, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Employee } from 'fizz-kidz'
import React, { useEffect, useMemo, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'
import Loader from '@components/ScienceClub/shared/Loader'
import { styled } from '@mui/material/styles'

import VerificationButton from './VerificationButton'

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

    const [loading, setLoading] = useState(true)
    const [employees, setEmployees] = useState<Employee[]>([])

    useEffect(() => {
        const unsubscribe = firebase.db
            .collection('employees')
            .orderBy('created')
            .onSnapshot((snap) => {
                setEmployees(snap.docs.map((doc) => doc.data() as Employee))
                setLoading(false)
            })

        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { employees, loading }
}

const EmployeeTable = () => {
    const { employees, loading } = useEmployees()
    const [expandedRows, setExpandedRows] = useState<string[]>([])

    const columns = useMemo<ColumnsType<Employee>>(
        () => [
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
                title: 'Action',
                render: (employee: Employee) =>
                    employee.status === 'verification' && <VerificationButton employee={employee} />,
            },
        ],
        []
    )

    // const data = useMemo(() => employees.map((employee) => ({ key: employee.id, employee })), [employees])

    const renderBadge = (status: Employee['status']) => {
        switch (status) {
            case 'form-sent':
                return <Tag color="orange">Form Sent</Tag>
            case 'generating-accounts':
                return <Tag color="volcano">Generating Accounts</Tag>
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

    if (loading) return <Loader style={{ marginTop: '4rem' }} />

    return (
        <Table
            columns={columns}
            dataSource={employees.map((employee) => ({ ...employee, key: employee.id }))}
            size="small"
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
