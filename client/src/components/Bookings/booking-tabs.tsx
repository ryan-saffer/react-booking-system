import { useState } from 'react'

import CakeIcon from '@mui/icons-material/CakeRounded'
import SchoolIcon from '@mui/icons-material/SchoolRounded'
import { Tab, Tabs } from '@mui/material'

import { PartiesAndEvents } from './parties-and-events'
import Incursions from './events/incursions'

const BookingTabs = () => {
    const [selectedTab, setSelectedTab] = useState(0)

    return (
        <>
            <Tabs
                value={selectedTab}
                onChange={(_, val) => setSelectedTab(val)}
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                sx={{ minHeight: 42, height: 42 }}
            >
                <Tab
                    sx={{ minHeight: 42, height: 42 }}
                    label="Parties & Events"
                    icon={<CakeIcon />}
                    iconPosition="start"
                />
                <Tab sx={{ minHeight: 42, height: 42 }} label="Incursions" icon={<SchoolIcon />} iconPosition="start" />
            </Tabs>
            {selectedTab === 0 && <PartiesAndEvents />}
            {selectedTab === 1 && <Incursions />}
        </>
    )
}

export default BookingTabs
