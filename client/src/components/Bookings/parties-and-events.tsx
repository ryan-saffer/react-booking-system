import { Location, capitalise } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import { Button, Grid, Skeleton, Stack, Typography } from '@mui/material'

import EventPanel from './events/event-panel'
import { useEvents } from './events/use-events'
import { FilterDrawer } from './filter-drawer'
import PartyPanel from './parties/party-panel'
import { usePartyBookings } from './parties/use-party-bookings'
import { useFilter } from './use-filter'

export const PartiesAndEvents = () => {
    const {
        selectedLocations,
        filterActive,
        setLocation,
        toggleShowEvents,
        toggleShowParties,
        showParties,
        showEvents,
    } = useFilter()

    const [loading, setLoading] = useState(true)
    const [openFilter, setOpenFilter] = useState(false)

    const bookings = usePartyBookings({ setLocation })
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
            <Button
                sx={{
                    float: 'right',
                    marginRight: 2,
                    marginTop: 1,
                    background: filterActive ? '#EF4444' : 'primary',
                }}
                onClick={() => setOpenFilter(true)}
                endIcon={filterActive ? <FilterListIcon /> : <FilterListOffIcon />}
                variant={filterActive ? 'contained' : 'outlined'}
                color={filterActive ? 'secondary' : 'primary'}
            >
                {filterActive ? 'filter on' : 'filter off'}
            </Button>
            <FilterDrawer
                open={openFilter}
                handleClose={() => setOpenFilter(false)}
                showParties={showParties}
                toggleShowParties={toggleShowParties}
                showEvents={showEvents}
                toggleShowEvents={toggleShowEvents}
                selectedLocations={selectedLocations}
                setLocation={setLocation}
            />
            {loading && Array.from(Array(3)).map((_, idx) => <BookingsSkeleton key={idx} />)}
            {bookings.status === 'loaded' && events.status === 'loaded' && !loading && (
                <Grid item xs sm md>
                    {Object.values(Location).map(
                        (location) =>
                            selectedLocations[location] && (
                                <div key={location}>
                                    <Typography variant="h5" sx={{ paddingTop: 2 }}>
                                        {capitalise(location)} Studio
                                    </Typography>
                                    <div style={{ marginLeft: 8, paddingTop: 12 }}>
                                        {bookings.result[location].length === 0 &&
                                            events.result[location].length === 0 && (
                                                <Typography variant="overline">No bookings</Typography>
                                            )}
                                        {showParties && bookings.result[location].length > 0 && (
                                            <div style={{ marginBottom: 8 }}>
                                                <Typography variant="h6" sx={{ fontSize: 16, paddingBottom: 1 }}>
                                                    Parties
                                                </Typography>
                                                {bookings.result[location].map((booking) => (
                                                    <PartyPanel key={booking.id} booking={booking} />
                                                ))}
                                            </div>
                                        )}
                                        {!showParties && bookings.result[location].length > 0 && (
                                            <Typography variant="overline" sx={{ display: 'block' }}>
                                                Hiding Parties
                                            </Typography>
                                        )}
                                        {showEvents && events.result[location].length > 0 && (
                                            <>
                                                <Typography variant="h6" sx={{ fontSize: 16, paddingBottom: 1 }}>
                                                    Events
                                                </Typography>
                                                {events.result[location].map((event) => (
                                                    <EventPanel key={event.id} event={event} />
                                                ))}
                                            </>
                                        )}
                                        {!showEvents && events.result[location].length > 0 && (
                                            <Typography variant="overline" sx={{ display: 'block' }}>
                                                Hiding Events
                                            </Typography>
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
