import React from 'react'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { GoogleForm } from 'fizz-kidz'
import * as Utilities from '../../utilities'

const LocationCheckboxes = props => {

    const { values, handleChange } = props

    return (
        <FormGroup row>
            {Object.values(GoogleForm.Locations).map(location =>
                <FormControlLabel
                    key={location}
                    control={
                        <Checkbox checked={values[location]} onChange={handleChange(location)} value={location} />
                    }
                    label={Utilities.capitalise(location)}
                />
            )}
        </FormGroup>
    )
}

export default LocationCheckboxes