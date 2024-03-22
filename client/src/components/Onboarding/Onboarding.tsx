import { Button, Layout, Typography } from 'antd'
import { useState } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { styled } from '@mui/material/styles'

import EmployeeTable from './EmployeeTable'
import NewEmployeeForm from './NewEmployeeForm'

const PREFIX = 'Onboarding'

const classes = {
    header: `${PREFIX}-header`,
    flexCol: `${PREFIX}-flexCol`,
    list: `${PREFIX}-list`,
    'gap-16': `${PREFIX}-gap-16`,
}

const StyledLayout = styled(Layout)({
    [`& .${classes.header}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    [`& .${classes.flexCol}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
    [`& .${classes['gap-16']}`]: {
        gap: 16,
    },
    [`& .${classes.list}`]: {
        '& li': {
            marginBottom: 8,
        },
    },
})

const { Content } = Layout
const { Title } = Typography

export const Onboarding = () => {
    const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false)

    return (
        <StyledLayout style={{ background: 'rgb(240, 242, 245)', height: '100%', minHeight: 'calc(100vh - 64px)' }}>
            <Content style={{ background: 'white', padding: 32, margin: 32 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}
                >
                    <Title style={{ margin: 0 }}>Onboarding</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowNewEmployeeModal(true)}>
                        New Employee
                    </Button>
                </div>
                <EmployeeTable />
                <NewEmployeeForm open={showNewEmployeeModal} onCancel={() => setShowNewEmployeeModal(false)} />
            </Content>
        </StyledLayout>
    )
}
