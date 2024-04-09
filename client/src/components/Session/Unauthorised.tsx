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
                    subTitle={
                        <p>
                            Sorry, you are not authorised to access this page.
                            <br />
                            <br />
                            If you think this is a mistake, be sure you have selected a studio on the top right.
                        </p>
                    }
                />
            </Content>
        </Layout>
    )
}

export default Unauthorised
