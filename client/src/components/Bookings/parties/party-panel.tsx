import dateFormat from 'dateformat'
import { Booking, FirestoreBooking, WithId } from 'fizz-kidz'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Grid } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import { ExistingBookingForm } from './forms/ExistingBookingForm'

const PREFIX = 'BookingPanel'

const classes = {
    heading: `${PREFIX}-heading`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
    summary: `${PREFIX}-summary`,
    chipPurple: `${PREFIX}-chipPurple`,
    chipGreen: `${PREFIX}-chipGreen`,
    test: `${PREFIX}-test`,
    accordionHeading: `${PREFIX}-accordionRow2`,
    root: `${PREFIX}-root`,
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

const PartyPanel = ({ booking }: { booking: WithId<FirestoreBooking> }) => {
    return (
        <StyledAccordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.summary}>
                    <div className={classes.accordionHeading}>
                        <Typography className={classes.heading}>
                            {dateFormat(booking.dateTime.toDate(), 'h:MM TT')} -{' '}
                            {dateFormat(getEndDate(booking.dateTime.toDate(), booking.partyLength), 'h:MM TT')}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {booking.parentFirstName} {booking.parentLastName} - {booking.childName}
                            's {booking.childAge}th
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }}
                    >
                        {booking.type === 'studio' && booking.includesFood === false && (
                            <CustomChip label="Self Catered" color="#fecaca" />
                        )}
                        <CustomChip
                            label={booking.type === 'studio' ? 'Studio' : 'Mobile'}
                            color={booking.type === 'studio' ? '#CAEDFF' : '#D8B4F8'}
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

function CustomChip({ label, color }: { label: string; color: string }) {
    return (
        <Typography
            variant="body1"
            className="gotham"
            sx={{
                fontWeight: 1000,
                fontSize: 14,
                textAlign: 'center',
                background: color,
                px: 2,
                py: 1,
                borderRadius: 1,
                marginRight: 1,
                width: 120,
            }}
        >
            {label}
        </Typography>
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

export default PartyPanel
