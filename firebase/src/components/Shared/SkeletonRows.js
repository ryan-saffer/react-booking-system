import React from 'react'

import { Skeleton } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core'

const SkeletonRows = props => {

    const rowCount = Math.floor(props.rowCount)
    
    const classes = useStyles()

    return (
        <>
            {[...Array(rowCount)].map((_, i) => <Skeleton className={classes.skeleton} key={i} animation="wave" height={64} />)}
        </>
    )
}

const useStyles = makeStyles(theme => ({
    skeleton: {
        margin: '0px 24px 0px 24px'
    }
}))

export default SkeletonRows