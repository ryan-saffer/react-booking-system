import React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { Location } from 'fizz-kidz'
import * as Utilities from '../../utilities/stringUtilities'
import { useMediaQuery } from '@mui/material'

const LocationCheckboxes = (props) => {
    const { values, handleChange } = props

    const isMobile = useMediaQuery('(max-width: 460px)')

    return (
        <>
            {Object.values(Location).map((location) => (
                <FormControlLabel
                    key={location}
                    control={
                        <Checkbox
                            size={isMobile ? 'small' : 'medium'}
                            checked={values[location]}
                            onChange={handleChange(location)}
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
