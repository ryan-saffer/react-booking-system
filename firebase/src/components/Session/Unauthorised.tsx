import { Button, Layout, Result } from 'antd'
import React from 'react'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'

const { Header, Content } = Layout

type Props = {}

const Unauthorised: React.FC<Props> = () => {
    const navigate = useNavigate()
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
                        <Button type="primary" onClick={() => navigate(ROUTES.LANDING)}>
                            Back Home
                        </Button>
                    }
                />
            </Content>
        </Layout>
    )
}

export default Unauthorised
