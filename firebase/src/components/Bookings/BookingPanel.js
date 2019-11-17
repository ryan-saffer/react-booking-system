import React from 'react'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import NewBookingForm from '../Forms/NewBookingForm'
import ExistingBookingForm from '../Forms/ExistingBookingForm'

var dateFormat = require('dateformat')

const useStyles = makeStyles(theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '40%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    }
}));

const BookingPanel = props => {

    const classes = useStyles()

    const { booking } = props

    return (
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                >
                    <Typography className={classes.heading}>
                    {dateFormat(booking.dateTime.toDate(), "h:MM TT")} - {dateFormat(getEndDate(booking.dateTime.toDate(), booking.partyLength), "h:MM TT")}
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {booking.parentFirstName} {booking.parentLastName}: {booking.childName}'s {booking.childAge}th
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Grid container spacing={3}>
                        <Grid item xs>
                            <ExistingBookingForm booking={booking} />
                        </Grid>
                    </Grid>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
}

/**
   * Determines the parties end date/time based on starting time and length
   * 
   * @returns {Date} the date and time the party ends
   */
function getEndDate(dateTime, partyLength) {
  
    // determine when party ends
    var lengthHours = 0;
    var lengthMinutes = 0;
    switch (partyLength) {
        case "1":
            lengthHours = 1;
            break;
        case "1.5":
            lengthHours = 1;
            lengthMinutes = 30;
            break;
        case "2":
            lengthHours = 2;
            break;
        default:
            break;
    }
    
    var endDate = new Date(
        dateTime.getFullYear(),
        dateTime.getMonth(),
        dateTime.getDate(),
        dateTime.getHours() + lengthHours,
        dateTime.getMinutes() + lengthMinutes
    )
    
    return endDate
}

export default BookingPanel