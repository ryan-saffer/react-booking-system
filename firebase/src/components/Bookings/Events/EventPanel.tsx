import { Accordion, AccordionDetails, AccordionSummary, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { EventBooking } from 'fizz-kidz'
import dateFormat from 'dateformat'
// import ExistingEventForm from '../Forms/EventForm/ExistingEventForm'

type Props = {
    event: EventBooking
    onDeleteEvent: (date: Date) => void
}

const EventPanel: React.FC<Props> = ({ event, onDeleteEvent }) => {
    const classes = useStyles()

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>
                    {dateFormat(event.startTime, 'h:MM TT')} - {dateFormat(event.endTime, 'h:MM TT')}
                </Typography>
                <Typography className={classes.secondaryHeading}>{event.organisation}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ margin: 16 }}>
                    {/* <ExistingEventForm event={event} onDeleteEvent={onDeleteEvent} /> */}
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

const useStyles = makeStyles((theme) => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '40%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}))

export default EventPanel
