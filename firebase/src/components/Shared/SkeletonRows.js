import React from 'react'

import { Skeleton } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core'

const SkeletonRows = () => {
    
    const classes = useStyles()

    return (
        <>
            <Skeleton className={classes.skeleton} animation="wave" height={64} />
            <Skeleton className={classes.skeleton} animation="wave" height={64} />
            <Skeleton className={classes.skeleton} animation="wave" height={64} />
            <Skeleton className={classes.skeleton} animation="wave" height={64} />
        </>
    )
}

const useStyles = makeStyles(theme => ({
    skeleton: {
        margin: '0px 24px 0px 24px'
    }
}))

export default SkeletonRows