import { Event, Service } from 'fizz-kidz'
import React from 'react'

import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import EventPanel from './EventPanel'

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

type Props = {
    events: Service<Event[]>
}

const Events: React.FC<Props> = ({ events }) => {
    const title = () => (
        <Typography style={{ paddingTop: 16, paddingBottom: 8 }} variant="h6">
            Events
        </Typography>
    )

    const noEvents = () => <Typography variant="overline">No events</Typography>

    switch (events.status) {
        case 'loaded':
            return (
                <>
                    {title()}
                    {events.result.map((event) => (
                        <EventPanel event={event} key={event.id} />
                    ))}
                    {events.result.length === 0 && noEvents()}
                </>
            )
        case 'loading':
            return (
                <>
                    {title()}
                    {noEvents()}
                </>
            )
        default:
            return <Root>Error</Root>
    }
}

export default Events
