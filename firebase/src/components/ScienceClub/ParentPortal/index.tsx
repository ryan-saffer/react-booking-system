import { makeStyles } from '@material-ui/core'
import React from 'react'
import Root from '../../Shared/Root'
import ParentPortalMain from './ParentPortal'

export const ParentPortalRoot = () => {
    const classes = useStyles()

    return (
        <Root color="green" width="full" logoSize="sm">
            <div className={classes.main}>
                <ParentPortalMain />
            </div>
        </Root>
    )
}

const useStyles = makeStyles({
    main: {
        minHeight: '80vh',
        width: '100%',
    },
})
