import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { makeStyles } from '@material-ui/core'
import { Spin } from 'antd'

type Props = {
    className?: string
    style?: React.CSSProperties
    size?: 'sm' | 'lg'
}

const defaultProps: Props = {
    size: 'lg',
}

const Loader: React.FC<Props> = (_props) => {
    const props = {
        ...defaultProps,
        ..._props,
    }

    const { className, style, size } = props
    const classes = useStyles()

    const antIcon = <LoadingOutlined style={{ fontSize: size === 'sm' ? 24 : 48 }} spin />
    return (
        <div className={`${classes.loading} ${className}`} style={style}>
            <Spin indicator={antIcon} />
        </div>
    )
}

const useStyles = makeStyles({
    loading: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default Loader
