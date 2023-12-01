import { useState } from 'react'

import CakeIcon from '@mui/icons-material/CakeRounded'
import SchoolIcon from '@mui/icons-material/SchoolRounded'
import StadiumIcon from '@mui/icons-material/StadiumRounded'
import { Tab, Tabs } from '@mui/material'

import { Bookings } from '../parties/Bookings'
import Events from '../events/Events'

const BookingsSwitcher = () => {
    const [selectedTab, setSelectedTab] = useState(1)

    return (
        <>
            <Tabs
                value={selectedTab}
                onChange={(_, val) => setSelectedTab(val)}
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                sx={{ height: 16 }}
            >
                <Tab sx={{ minHeight: 36, height: 36 }} label="Parties" icon={<CakeIcon />} iconPosition="start" />
                <Tab sx={{ minHeight: 36, height: 36 }} label="Events" icon={<StadiumIcon />} iconPosition="start" />
                <Tab sx={{ minHeight: 36, height: 36 }} label="Incursions" icon={<SchoolIcon />} iconPosition="start" />
            </Tabs>

            {selectedTab === 0 && <Bookings />}
            {selectedTab === 1 && <Events type="standard" />}
            {selectedTab === 2 && <Events type="incursion" />}
        </>
    )
}

export default BookingsSwitcher
