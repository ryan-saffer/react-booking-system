import { makeStyles, Typography } from '@material-ui/core'
import { EventBooking, Service } from 'fizz-kidz'
import React from 'react'
import EventPanel from './EventPanel'

type Props = {
    events: Service<EventBooking[]>
    onDeleteEvent: (date: Date) => void
}

const Events: React.FC<Props> = ({ events, onDeleteEvent }) => {
    const classes = useStyles()

    switch (events.status) {
        case 'loaded':
            return (
                <>
                    <Typography className={classes.heading} variant="h6">
                        Events
                    </Typography>
                    {events.result.map((event, idx) => (
                        <EventPanel event={event} onDeleteEvent={onDeleteEvent} key={idx} />
                    ))}
                    {events.result.length === 0 && <Typography variant="overline">No events</Typography>}
                </>
            )

        default:
            return <h1>Error</h1>
    }
}

const useStyles = makeStyles((theme) => ({
    heading: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
}))

export default Events
