import { CircularProgress, makeStyles } from '@material-ui/core'
import React from 'react'

const Loading = () => {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <CircularProgress />
        </div>
    )
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
    },
})

export default Loading
