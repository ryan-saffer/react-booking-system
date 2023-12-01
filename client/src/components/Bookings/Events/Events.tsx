import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import EventPanel from './EventPanel'
import { useEvents } from './UseEvents'
import { Event, Location, capitalise } from 'fizz-kidz'
import LocationCheckboxes from '../parties/LocationCheckboxes'

const PREFIX = 'Events'

const classes = {
    heading: `${PREFIX}-heading`,
}

const Root = styled('h1')(({ theme }) => ({
    [`& .${classes.heading}`]: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
}))

const Events = ({ type }: { type: Event['type'] }) => {
    const events = useEvents(type)

    const noEvents = (type: string) => <Typography variant="overline">No {type}</Typography>

    if (type === 'standard') {
        return (
            <>
                <LocationCheckboxes handleChange={() => {}} values={{}} />
                {(() => {
                    if (events.status === 'error') {
                        return <Root>Error</Root>
                    }

                    return (
                        <>
                            {Object.values(Location).map((location) => {
                                const filteredEvents =
                                    events.status === 'loaded'
                                        ? events.result.filter((it) => it.studio === location)
                                        : []
                                return (
                                    <>
                                        <Typography style={{ paddingTop: 16, paddingBottom: 8 }} variant="h6">
                                            {capitalise(location)}
                                        </Typography>
                                        {events.status === 'loading' && noEvents('events')}
                                        {events.status === 'loaded' &&
                                            filteredEvents.length === 0 &&
                                            noEvents('events')}
                                        {events.status === 'loaded' &&
                                            filteredEvents.map((event) => <EventPanel key={event.id} event={event} />)}
                                    </>
                                )
                            })}
                        </>
                    )
                })()}
            </>
        )
    } else {
        // incursions
        if (events.status === 'error') {
            return <Root>Error</Root>
        }
        return (
            <>
                <Typography style={{ paddingTop: 16, paddingBottom: 8 }} variant="h6">
                    Incursions
                </Typography>
                {(() => {
                    return (
                        <>
                            {events.status === 'loading' && noEvents('incursions')}
                            {events.status === 'loaded' && events.result.length === 0 && noEvents('incursions')}
                            {events.status === 'loaded' &&
                                events.result.map((event) => <EventPanel key={event.id} event={event} />)}
                        </>
                    )
                })()}
            </>
        )
    }
}

export default Events
