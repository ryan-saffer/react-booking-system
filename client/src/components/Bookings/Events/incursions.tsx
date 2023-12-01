import { Skeleton, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import EventPanel from './event-panel'
import { useEvents } from './use-events'
import { useMemo } from 'react'

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

const Incursions = () => {
    const events = useEvents('incursion')

    const combinedEvents = useMemo(
        () => (events.status === 'loaded' ? Object.values(events.result).flat(1) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [events.status]
    )

    if (events.status === 'error') {
        return <Root>Error</Root>
    }

    if (events.status === 'loading') {
        return (
            <Stack gap={1} sx={{ marginTop: 2 }}>
                <Skeleton variant="rounded" width={100} height={30} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
            </Stack>
        )
    }

    if (events.status === 'loaded') {
        return (
            <>
                <Typography style={{ paddingTop: 16, paddingBottom: 8 }} variant="h6">
                    Incursions
                </Typography>
                {combinedEvents.length === 0 && <Typography variant="overline">No incursions</Typography>}
                {combinedEvents.map((event) => (
                    <EventPanel key={event.id} event={event} />
                ))}
            </>
        )
    }
}

export default Incursions
