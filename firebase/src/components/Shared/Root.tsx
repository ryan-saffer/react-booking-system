import React from 'react'
import { Card, Row } from 'antd'
import { makeStyles, Theme } from '@material-ui/core'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'

type Props = {
    color: 'pink' | 'green'
    width?: 'centered' | 'full'
    logoSize?: 'sm' | 'lg'
}

const defaultProps: Partial<Props> = {
    width: 'centered',
    logoSize: 'lg',
}

const Root: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }
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
    logo: (props) => ({
        maxWidth: props.logoSize === 'lg' ? 200 : 130,
    }),
    root: (props) => ({
        backgroundImage:
            props.color === 'pink'
                ? 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)'
                : 'linear-gradient(45deg, #2FEAA8, #028CF3)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 36,
        paddingBottom: 36,
        paddingRight: 20,
        paddingLeft: 20,
    }),
    card: (props) => ({
        width: '100%',
        height: 'fit-content',
        maxWidth: props.width === 'centered' ? 600 : '100%',
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    }),
}))

export default Root
