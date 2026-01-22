import { Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import type { FirestoreBooking, StandardEvent, WithId } from 'fizz-kidz'
import { ObjectKeys, capitalise } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { getOrgName } from '@utils/studioUtils'

import EventPanel from './events/event-panel'
import { useEvents } from './events/use-events'
import { useLocationFilter } from './location-filter/location-filter.hook'
import PartyPanel from './parties/party-panel'
import { usePartyBookings } from './parties/use-party-bookings'

export const PartiesAndEvents = () => {
    const { selectedLocation } = useLocationFilter()

    const [loading, setLoading] = useState(true)

    const bookings = usePartyBookings()
    const events = useEvents('standard')

    const { currentOrg } = useOrg()

    useEffect(() => {
        if (bookings.status === 'loading' || events.status === 'loading') {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [bookings.status, events.status, setLoading])

    return (
        <>
            <Toaster richColors />
            {loading && [1, 2, 3].map((idx) => <BookingsSkeleton key={idx} />)}
            {bookings.status === 'loaded' && events.status === 'loaded' && !loading && (
                <Grid item xs sm md>
                    {currentOrg === 'master' ? (
                        ObjectKeys(bookings.result).map(
                            (location) =>
                                (selectedLocation === location || selectedLocation === 'all') && (
                                    <LocationBookings
                                        key={location}
                                        name={`${capitalise(location)} Studio`}
                                        bookings={bookings.result[location]}
                                        events={events.result[location]}
                                    />
                                )
                        )
                    ) : (
                        <LocationBookings
                            name={getOrgName(currentOrg!)}
                            bookings={bookings.result[currentOrg!]}
                            events={events.result[currentOrg!]}
                        />
                    )}
                </Grid>
            )}
        </>
    )
}

const LocationBookings = ({
    name,
    bookings,
    events,
}: {
    name: string
    bookings: WithId<FirestoreBooking>[]
    events: StandardEvent[]
}) => {
    return (
        <>
            <h2 className="lilita" style={{ margin: 0, paddingTop: 16 }}>
                {name}
            </h2>
            <div style={{ paddingTop: 12 }}>
                {bookings.length === 0 && events.length === 0 && (
                    <div
                        style={{
                            background: 'white',
                            padding: 16,
                            paddingLeft: 24,
                            borderRadius: 12,
                        }}
                    >
                        <Typography variant="overline">No bookings on this day</Typography>
                    </div>
                )}
                {bookings.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                        <h6 className="lilita" style={{ fontSize: 16, margin: 0, paddingBottom: 8 }}>
                            Parties
                        </h6>
                        {bookings.map((booking) => (
                            <PartyPanel key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}
                {events.length > 0 && (
                    <div>
                        <h6 className="lilita" style={{ fontSize: 16, margin: 0, padding: '8px 0 8px 0' }}>
                            Events
                        </h6>
                        {events.map((event) => (
                            <EventPanel key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

const BookingsSkeleton = () => (
    <>
        <Skeleton variant="rounded" width={170} height={30} sx={{ marginBottom: 1, marginTop: 2 }} />
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
