import React from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { Chip, Grid } from '@material-ui/core'
import ExistingBookingForm from './Forms/ExistingBookingForm'
import { useScopes } from '../Hooks/UseScopes'
import StoreIcon from '@material-ui/icons/Store'
import DriveEtaIcon from '@material-ui/icons/DriveEta'

var dateFormat = require('dateformat')

const useStyles = makeStyles((theme) => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    summary: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chipPurple: {
        backgroundColor: '#B14592',
        color: 'white',
        '& svg': { color: 'white' },
        fontWeight: 600,
    },
    chipBlue: {
        backgroundColor: '#9ECC45',
        fontWeight: 600,
        '& svg': { color: 'white' },
        color: 'white',
    },
}))

const BookingPanel = (props) => {
    const classes = useStyles()

    const isRestricted = useScopes().CORE === 'restricted'

    const { bookingId, booking } = props

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.summary}>
                    <Typography className={classes.heading}>
                        {dateFormat(booking.dateTime.toDate(), 'h:MM TT')} -{' '}
                        {dateFormat(getEndDate(booking.dateTime.toDate(), booking.partyLength), 'h:MM TT')}
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {booking.parentFirstName} {isRestricted ? 'xxxxx' : booking.parentLastName}: {booking.childName}
                        's {booking.childAge}th
                    </Typography>
                    <Chip
                        label={booking.type === 'studio' ? 'Studio' : 'Mobile'}
                        variant="outlined"
                        className={booking.type === 'studio' ? classes.chipPurple : classes.chipBlue}
                        icon={booking.type === 'studio' ? <StoreIcon /> : <DriveEtaIcon />}
                    />
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={3}>
                    <Grid item xs>
                        <ExistingBookingForm onSuccess={props.onSuccess} bookingId={bookingId} booking={booking} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}

/**
 * Determines the parties end date/time based on starting time and length
 *
 * @returns {Date} the date and time the party ends
 */
function getEndDate(dateTime, partyLength) {
    // determine when party ends
    var lengthHours = 0
    var lengthMinutes = 0
    switch (partyLength) {
        case '1':
            lengthHours = 1
            break
        case '1.5':
            lengthHours = 1
            lengthMinutes = 30
            break
        case '2':
            lengthHours = 2
            break
        default:
            break
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
