import { Layout, Result } from 'antd'
import React from 'react'

const { Content } = Layout

type Props = {
    showLogout?: boolean
}

const Unauthorised: React.FC<Props> = () => {
    return (
        <Layout style={{ background: 'rgb(240, 242, 245)', height: '100vh' }}>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Result
                    status="403"
                    title="Unauthorised"
                    subTitle="Sorry, you are not authorised to access this page."
                />
            </Content>
        </Layout>
    )
}

export default Unauthorised
