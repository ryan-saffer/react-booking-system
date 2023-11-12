import { Button, Layout, Result } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'

const { Header, Content } = Layout

type Props = {
    showLogout?: boolean
}

const Unauthorised: React.FC<Props> = ({ showLogout = false }) => {
    const firebase = useFirebase()
    const navigate = useNavigate()

    const goHome = () => navigate(ROUTES.LANDING)
    const signOut = () => firebase.doSignOut()

    return (
        <Layout style={{ background: 'rgb(240, 242, 245)', height: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    style={{ height: 50, cursor: 'pointer' }}
                    src={Logo.default}
                    onClick={() => navigate(ROUTES.LANDING)}
                    alt="Fizz Kidz Logo"
                />
            </Header>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Result
                    status="403"
                    title="Unauthorised"
                    subTitle="Sorry, you are not authorised to access this page."
                    extra={
                        <Button type="primary" onClick={showLogout ? signOut : goHome}>
                            {showLogout ? 'Logout' : 'Back Home'}
                        </Button>
                    }
                />
            </Content>
        </Layout>
    )
}

export default Unauthorised
