import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { makeStyles } from '@material-ui/core'
import { Spin } from 'antd'

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />

const Loader = () => {
    const classes = useStyles()

    return (
        <div className={classes.loading}>
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
