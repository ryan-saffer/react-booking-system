import { Tag } from 'antd'
import dateFormat from 'dateformat'
import { Booking, FirestoreBooking, WithId } from 'fizz-kidz'

import DriveEtaIcon from '@mui/icons-material/DriveEta'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StoreIcon from '@mui/icons-material/Store'
import { Chip, Grid, useMediaQuery } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import { useScopes } from '../Hooks/UseScopes'
import { ExistingBookingForm } from './Forms/ExistingBookingForm'

const PREFIX = 'BookingPanel'

const classes = {
    heading: `${PREFIX}-heading`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
    summary: `${PREFIX}-summary`,
    chipPurple: `${PREFIX}-chipPurple`,
    chipGreen: `${PREFIX}-chipGreen`,
    test: `${PREFIX}-test`,
    accordionHeading: `${PREFIX}-accordionRow2`,
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: 500,
    },

    [`& .${classes.secondaryHeading}`]: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },

    [`& .${classes.chipPurple}`]: {
        backgroundColor: '#B14592',
        color: 'white',
        '& svg': { color: 'white' },
        fontWeight: 600,
    },

    [`& .${classes.chipGreen}`]: {
        backgroundColor: '#9ECC45',
        fontWeight: 600,
        '& svg': { color: 'white' },
        color: 'white',
    },

    [`& .${classes.summary}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },

    [`& .${classes.accordionHeading}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
}))

const BookingPanel = ({ booking }: { booking: WithId<FirestoreBooking> }) => {
    const isRestricted = useScopes().CORE === 'restricted'

    const isMobile = useMediaQuery('(max-width: 460px')

    return (
        <StyledAccordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ width: '100%' }}>
                <div className={classes.summary}>
                    <div className={classes.accordionHeading}>
                        <Typography className={classes.heading}>
                            {dateFormat(booking.dateTime.toDate(), 'h:MM TT')} -{' '}
                            {dateFormat(getEndDate(booking.dateTime.toDate(), booking.partyLength), 'h:MM TT')}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {booking.parentFirstName} {isRestricted ? 'xxxxx' : booking.parentLastName} -{' '}
                            {booking.childName}
                            's {booking.childAge}th
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            ...(isMobile && { flexDirection: 'column-reverse', gap: 4 }),
                        }}
                    >
                        <Tag
                            color={booking.oldPrices ? 'volcano-inverse' : 'green-inverse'}
                            style={{ textAlign: 'center', fontWeight: 600 }}
                        >
                            {booking.oldPrices ? 'OLD PRICE' : 'NEW PRICE'}
                        </Tag>
                        <Chip
                            label={booking.type === 'studio' ? 'Studio' : 'Mobile'}
                            variant="outlined"
                            className={booking.type === 'studio' ? classes.chipPurple : classes.chipGreen}
                            icon={booking.type === 'studio' ? <StoreIcon /> : <DriveEtaIcon />}
                        />
                    </div>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={3}>
                    <Grid item xs>
                        <ExistingBookingForm booking={booking} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </StyledAccordion>
    )
}

/**
 * Determines the parties end date/time based on starting time and length
 *
 * @returns {Date} the date and time the party ends
 */
function getEndDate(dateTime: Date, partyLength: Booking['partyLength']) {
    // determine when party ends
    let lengthHours = 0
    let lengthMinutes = 0
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

    const endDate = new Date(
        dateTime.getFullYear(),
        dateTime.getMonth(),
        dateTime.getDate(),
        dateTime.getHours() + lengthHours,
        dateTime.getMinutes() + lengthMinutes
    )

    return endDate
}

export default BookingPanel
