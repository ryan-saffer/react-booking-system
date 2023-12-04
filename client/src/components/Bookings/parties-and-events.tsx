import { Location, capitalise } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import { Grid, Skeleton, Stack, Typography } from '@mui/material'

import EventPanel from './events/event-panel'
import { useEvents } from './events/use-events'
import PartyPanel from './parties/party-panel'
import { usePartyBookings } from './parties/use-party-bookings'
import { useLocationFilter } from './location-filter/location-filter.hook'

export const PartiesAndEvents = () => {
    const { selectedLocation } = useLocationFilter()

    const [loading, setLoading] = useState(true)

    const bookings = usePartyBookings()
    const events = useEvents('standard')

    useEffect(() => {
        if (bookings.status === 'loading' || events.status === 'loading') {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [bookings.status, events.status, setLoading])

    return (
        <>
            {loading && Array.from(Array(3)).map((_, idx) => <BookingsSkeleton key={idx} />)}
            {bookings.status === 'loaded' && events.status === 'loaded' && !loading && (
                <Grid item xs sm md>
                    {Object.values(Location).map(
                        (location) =>
                            (selectedLocation === location || selectedLocation === 'all') && (
                                <div key={location}>
                                    <h2 className="lilita" style={{ margin: 0, paddingTop: 16 }}>
                                        {capitalise(location)} Studio
                                    </h2>
                                    <div style={{ marginLeft: 8, paddingTop: 12 }}>
                                        {bookings.result[location].length === 0 &&
                                            events.result[location].length === 0 && (
                                                <div
                                                    style={{
                                                        background: 'white',
                                                        padding: 16,
                                                        paddingLeft: 24,
                                                        borderRadius: 12,
                                                    }}
                                                >
                                                    <Typography variant="overline">No bookings on this day.</Typography>
                                                </div>
                                            )}
                                        {bookings.result[location].length > 0 && (
                                            <div style={{ marginBottom: 8 }}>
                                                <h6
                                                    className="lilita"
                                                    style={{ fontSize: 16, margin: 0, paddingBottom: 8 }}
                                                >
                                                    Parties
                                                </h6>
                                                {bookings.result[location].map((booking) => (
                                                    <PartyPanel key={booking.id} booking={booking} />
                                                ))}
                                            </div>
                                        )}
                                        {events.result[location].length > 0 && (
                                            <>
                                                <h6
                                                    className="lilita"
                                                    style={{ fontSize: 16, margin: 0, padding: '8px 0 8px 0' }}
                                                >
                                                    Events
                                                </h6>
                                                {events.result[location].map((event) => (
                                                    <EventPanel key={event.id} event={event} />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                    )}
                </Grid>
            )}
        </>
    )
}

const BookingsSkeleton = () => (
    <>
        <Skeleton variant="rounded" width={100} height={30} sx={{ marginBottom: 1, marginTop: 2 }} />
        <div style={{ marginLeft: 8 }}>
            <Stack gap={1}>
                <Skeleton variant="rounded" height={20} width={80} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={20} width={80} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
            </Stack>
        </div>
    </>
)
