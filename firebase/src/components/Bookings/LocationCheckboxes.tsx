import React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { Location } from 'fizz-kidz'
import * as Utilities from '../../utilities/stringUtilities'
import { useMediaQuery } from '@mui/material'

const LocationCheckboxes = ({
    values,
    handleChange,
}: {
    values: { [key in Location]?: boolean }
    handleChange: (location: Location, checked: boolean) => void
}) => {
    const isMobile = useMediaQuery('(max-width: 460px)')

    return (
        <>
            {Object.values(Location).map((location) => (
                <FormControlLabel
                    key={location}
                    control={
                        <Checkbox
                            id={location}
                            size={isMobile ? 'small' : 'medium'}
                            checked={values[location]}
                            onChange={(e) => handleChange(location, e.target.checked)}
                            value={location}
                            color="secondary"
                        />
                    }
                    label={Utilities.capitalise(location)}
                />
            ))}
        </>
    )
}

export default LocationCheckboxes
