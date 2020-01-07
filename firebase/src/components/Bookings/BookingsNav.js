import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import NavigateNext from '@material-ui/icons/NavigateNext'

const dateFormat = require('dateformat')

const useStyles = makeStyles({
    main: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    heading: {
        textAlign: 'center'
    }
})
const DateNav = props => {

    const classes = useStyles()

    const { onNavigateBefore, onNavigateNext, date } = props

    return (
        <div className={classes.main}>
            <Button onClick={onNavigateBefore}><NavigateBefore /></Button>
            <Typography className={classes.heading} variant="h6">{dateFormat(date, "dddd, mmmm dS, yyyy")}</Typography>
            <Button onClick={onNavigateNext}><NavigateNext /></Button>
        </div>
    )
}

export default DateNav