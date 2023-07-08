import React, { useEffect, useMemo, useState } from 'react'
import { Descriptions, Table, Tag } from 'antd'
import useFirebase from '../Hooks/context/UseFirebase'
import { Employee } from 'fizz-kidz'
import { ColumnsType } from 'antd/es/table'
import { makeStyles } from '@material-ui/core'

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
                console.log(snap.docs.map((doc) => doc.data()))
                setLoading(false)
            })

        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { employees, loading }
}

type TableData = {
    key: string
    employee: Employee
}

const EmployeeTable = () => {
    const { employees, loading } = useEmployees()
    const [expandedRows, setExpandedRows] = useState<string[]>([])

    const columns = useMemo<ColumnsType<TableData>>(
        () => [
            {
                key: 'firstName',
                dataIndex: 'employee',
                title: 'First Name',
                render: (employee: Employee) => employee.firstName,
            },
            {
                key: 'lastName',
                dataIndex: 'employee',
                title: 'Last Name',
                render: (employee: Employee) => employee.lastName,
            },
            {
                key: 'contract',
                dataIndex: 'employee',
                title: 'Contract Status',
                render: (employee: Employee) => (
                    <Tag color={employee.contractSigned ? 'green' : 'red'}>
                        {employee.contractSigned ? 'Signed' : 'Awaiting Signature'}
                    </Tag>
                ),
            },
            {
                key: 'status',
                dataIndex: 'employee',
                title: 'Status',
                render: (employee: Employee) => renderBadge(employee),
            },
        ],
        []
    )

    const data = useMemo(() => employees.map((employee) => ({ key: employee.id, employee })), [employees])

    const renderBadge = (employee: Employee) => {
        switch (employee.status) {
            case 'form-sent':
                return <Tag color="orange">Form Sent</Tag>
            case 'generating-accounts':
                return <Tag color="volcano">Generating Accounts</Tag>
            case 'verification':
                return <Tag color="red">Requires Verification</Tag>
            case 'complete':
                return <Tag color="green">Onboarding Complete</Tag>
            default: {
                const exhaustive: never = employee.status
                console.error(`unknown employee status: '${exhaustive}`)
            }
        }
    }

    // its so fast that its better to show nothing than flash a loader
    if (loading) return null

    return (
        <Table
            columns={columns}
            dataSource={data}
            size="small"
            expandable={{
                expandRowByClick: true,
                expandedRowRender: (columns) => <EmployeeDetails employee={columns.employee} />,
                expandedRowKeys: expandedRows,
                onExpand: (expanded, record) => setExpandedRows(expanded ? [record.key] : []),
            }}
        />
    )
}

const EmployeeDetails: React.FC<{ employee: Employee }> = ({ employee }) => {
    const classes = useStyles()

    return (
        <Descriptions bordered size="small" column={1} className={classes.details}>
            <Descriptions.Item label="First Name">{employee.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{employee.lastName}</Descriptions.Item>
            <Descriptions.Item label="Pronouns">{employee.pronouns}</Descriptions.Item>
            <Descriptions.Item label="DOB">{employee.dob}</Descriptions.Item>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{employee.mobile}</Descriptions.Item>
            <Descriptions.Item label="Address">{employee.address}</Descriptions.Item>
            <Descriptions.Item label="Base Wage">${employee.baseWage}</Descriptions.Item>
            <Descriptions.Item label="Manager">{employee.managerName}</Descriptions.Item>
        </Descriptions>
    )
}

const useStyles = makeStyles({
    details: {
        '& th': {
            width: '25%',
            '& span': {
                fontWeight: 700,
            },
        },
    },
})

export default EmployeeTable
