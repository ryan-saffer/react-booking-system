import React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { Location } from 'fizz-kidz'
import * as Utilities from '../../utilities/stringUtilities'

const LocationCheckboxes = (props) => {
    const { values, handleChange } = props

    return (
        <>
            {Object.values(Location).map((location) => (
                <FormControlLabel
                    key={location}
                    control={
                        <Checkbox
                            checked={values[location]}
                            onChange={handleChange(location)}
                            value={location}
                            color="secondary"
                        />
                    }
                    sx={{ gap: 1 }}
                    label={Utilities.capitalise(location)}
                />
            ))}
        </>
    )
}

export default LocationCheckboxes
