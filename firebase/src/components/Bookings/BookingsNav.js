import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import NavigateNext from '@material-ui/icons/NavigateNext'

const dateFormat = require('dateformat')

const useStyles = makeStyles({
    heading: {
        textAlign: 'center'
    },
    beforeButton: {
        textAlign: 'right',
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    nextButton: {
        tetAlign: 'left',
        marginTop: 'auto',
        marginBottom: 'auto'
    }
})
const DateNav = props => {

    const classes = useStyles()

    const { onNavigateBefore, onNavigateNext, date } = props

    return(
        <Grid container spacing={3}>
            <Grid item xs className={classes.beforeButton}>
                <Button onClick={onNavigateBefore}><NavigateBefore /></Button>
            </Grid>
            <Grid item xs>
                <Typography className={classes.heading} variant="h6">{dateFormat(date, "dddd, mmmm dS, yyyy")}</Typography>
            </Grid>
            <Grid item xs className={classes.nextButton}>
                <Button onClick={onNavigateNext}><NavigateNext /></Button>
            </Grid>
        </Grid>
    )
}

export default DateNav