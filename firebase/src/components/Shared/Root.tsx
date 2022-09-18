import React from 'react'
import { Card, Row } from 'antd'
import { makeStyles, Theme } from '@material-ui/core'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'

type Props = {
    color: 'pink' | 'green'
}

const Root: React.FC<Props> = (props) => {
    const classes = useStyles(props)

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <div className={classes.logoWrapper}>
                    <img className={classes.logo} src={Logo.default} />
                </div>
                <Row justify="center">{props.children}</Row>
            </Card>
        </div>
    )
}

const useStyles = makeStyles<Theme, Props>(() => ({
    logoWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        maxWidth: 200,
    },
    root: (props) => ({
        // backgroundColor: '#f0f2f2',
        backgroundImage:
            props.color === 'pink'
                ? 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)'
                : 'linear-gradient(45deg, #2FEAA8, #028CF3)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    }),
    card: {
        width: '90%',
        height: 'fit-content',
        maxWidth: 600,
        marginTop: 36,
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    },
}))

export default Root
