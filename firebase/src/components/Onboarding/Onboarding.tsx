import { makeStyles } from '@material-ui/core'
import { Button, Layout, Typography } from 'antd'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import EmployeeTable from './EmployeeTable'
import { PlusOutlined } from '@ant-design/icons'
import NewEmployeeForm from './NewEmployeeForm'

const { Header, Content } = Layout
const { Title } = Typography

export const Onboarding = () => {
    const classes = useStyles()
    const navigate = useNavigate()

    const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false)

    return (
        <Layout style={{ background: 'rgb(240, 242, 245)', minHeight: '100vh' }}>
            <Header className={classes.header}>
                <img
                    style={{ height: 50, cursor: 'pointer' }}
                    src={Logo.default}
                    onClick={() => navigate(ROUTES.LANDING)}
                    alt="Fizz Kidz Logo"
                />
            </Header>
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
        </Layout>
    )
}

const useStyles = makeStyles({
    header: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    'gap-16': { gap: 16 },
    list: {
        '& li': {
            marginBottom: 8,
        },
    },
})
