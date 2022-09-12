import React from 'react'
import { Card, Row } from 'antd'
import { makeStyles } from '@material-ui/core'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'

const Root: React.FC = ({ children }) => {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <div className={classes.logoWrapper}>
                    <img className={classes.logo} src={Logo.default} />
                </div>
                <Row justify="center">
                    {children}
                </Row>
            </Card>
        </div>
    )
}

const useStyles = makeStyles({
    logoWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        maxWidth: 200,
    },
    root: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        width: '90%',
        height: 'fit-content',
        maxWidth: 600,
        marginTop: 36,
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    },
})

export default Root
