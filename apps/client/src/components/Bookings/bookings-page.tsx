import { Chip } from '@mui/material'
import { useState } from 'react'

import { DateNavigation } from './date-navigation/date-navigation'
import Incursions from './events/incursions'
import { FilterContextProvider } from './location-filter/location-filter.provider'
import NewBookingDialog from './new-booking-dialog'
import { PartiesAndEvents } from './parties-and-events'

type Tab = 'parties' | 'incursions'
type NewBookingType = 'party' | 'event'

const PARTY_PREFILL_QUERY_KEYS = ['parentName', 'parentEmail', 'parentMobile', 'type', 'location', 'zohoDealId']

const hasPrefillQueryParams = (searchParams: URLSearchParams) => {
    return (
        searchParams.get('bookingType') === 'event' ||
        PARTY_PREFILL_QUERY_KEYS.some((key) => !!searchParams.get(key)?.trim())
    )
}

const getInitialBookingType = (searchParams: URLSearchParams): NewBookingType => {
    return searchParams.get('bookingType') === 'event' ? 'event' : 'party'
}

export const BookingsPage = () => {
    const searchParams =
        typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
    const initialBookingType = getInitialBookingType(searchParams)
    const [openNewBooking, setOpenNewBooking] = useState(() => {
        return hasPrefillQueryParams(searchParams)
    })

    const [selectedTab, setSelectedTab] = useState<Tab>(() =>
        initialBookingType === 'event' && searchParams.get('eventType')?.trim().toLowerCase() === 'incursion'
            ? 'incursions'
            : 'parties'
    )

    return (
        <FilterContextProvider>
            <DateNavigation
                label="Bookings"
                showButton
                buttonLabel="New Booking"
                onButtonPressed={() => setOpenNewBooking(true)}
            >
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <StyledChip
                            label="Parties & Events"
                            value="parties"
                            selectedValue={selectedTab}
                            handleClick={() => setSelectedTab('parties')}
                        />
                        <StyledChip
                            label="Incursions"
                            value="incursions"
                            selectedValue={selectedTab}
                            handleClick={() => setSelectedTab('incursions')}
                        />
                    </div>
                </div>
                {selectedTab === 'parties' && <PartiesAndEvents />}
                {selectedTab === 'incursions' && <Incursions />}
                <NewBookingDialog
                    open={openNewBooking}
                    initialBookingType={initialBookingType}
                    onBookingCreated={() => setOpenNewBooking(false)}
                />
            </DateNavigation>
        </FilterContextProvider>
    )
}

const StyledChip = ({
    label,
    value,
    selectedValue,
    handleClick,
}: {
    label: string
    value: Tab
    selectedValue: Tab
    handleClick: () => void
}) => {
    return (
        <Chip
            label={label}
            variant="outlined"
            onClick={handleClick}
            sx={{
                background: 'white',
                fontWeight: 450,
                color: selectedValue === value ? '#3883FE' : '1E1E1E',
                borderColor: selectedValue === value ? '#3883FE' : 'white',
                '& .MuiChip-label': {
                    fontSize: 16,
                    padding: 2,
                },
            }}
        />
    )
}
