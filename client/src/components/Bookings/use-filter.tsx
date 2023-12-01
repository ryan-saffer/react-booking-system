import { Location } from 'fizz-kidz'
import { useEffect, useState } from 'react'

export function useFilter() {
    const [selectedLocations, setSelectedLocations] = useState<Record<Location, boolean>>(
        Object.values(Location).reduce((acc, curr) => ({ ...acc, [curr]: true }), {} as any)
    )
    const setLocation = (location: Location, value: boolean) => {
        setSelectedLocations((prev) => ({ ...prev, [location]: value }))
        const newLocations = { ...selectedLocations, [location]: value }
        window.localStorage.setItem('selectedLocations', JSON.stringify(newLocations))
    }

    const [showParties, setShowParties] = useState(true)
    const toggleShowParties = () => {
        setShowParties((prev) => !prev)
        window.localStorage.setItem('showParties', JSON.stringify(!showParties))
    }

    const [showEvents, setShowEvents] = useState(true)
    const toggleShowEvents = () => {
        setShowEvents((prev) => !prev)
        window.localStorage.setItem('showEvents', JSON.stringify(!showEvents))
    }

    const filterActive =
        Object.values(selectedLocations).some((value) => value === false) || !showParties || !showEvents

    useEffect(() => {
        const initialLocations = JSON.parse(window.localStorage.getItem('selectedLocations')!)
        if (initialLocations) {
            setSelectedLocations(initialLocations)
        }

        const initialShowParties = JSON.parse(window.localStorage.getItem('showParties')!)
        if (initialShowParties !== null) {
            setShowParties(initialShowParties)
        }

        const initalShowEvents = JSON.parse(window.localStorage.getItem('showEvents')!)
        if (initalShowEvents !== null) {
            setShowEvents(initalShowEvents)
        }
    }, [])

    return {
        selectedLocations,
        setLocation,
        showParties,
        toggleShowParties,
        showEvents,
        toggleShowEvents,
        filterActive,
    }
}
