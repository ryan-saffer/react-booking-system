import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { Locations } from 'fizz-kidz'
import * as Utilities from '../../utilities/stringUtilities'

const LocationCheckboxes = (props) => {
    const { values, handleChange } = props

    return (
        <>
            {Object.values(Locations).map((location) => (
                <FormControlLabel
                    key={location}
                    control={<Checkbox checked={values[location]} onChange={handleChange(location)} value={location} />}
                    label={Utilities.capitalise(location)}
                />
            ))}
        </>
    )
}

export default LocationCheckboxes
