import React from 'react'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const LocationCheckboxes = props => {

    const { values, handleChange } = props

    return (
        <FormGroup row>
            <FormControlLabel
                control={
                    <Checkbox checked={values.balwyn} onChange={handleChange('balwyn')} value="balwyn" />
                }
                label="Balwyn"
            />
            <FormControlLabel
                control={
                    <Checkbox checked={values.essendon} onChange={handleChange('essendon')} value="essendon" />
                }
                label="Essendon"
            />
            <FormControlLabel
                control={
                    <Checkbox checked={values.malvern} onChange={handleChange('malvern')} value="malvern" />
                }
                label="Malvern"
            />
            <FormControlLabel
                control={
                    <Checkbox checked={values.mobile} onChange={handleChange('mobile')} value="mobile" />
                }
                label="Mobile"
            />
        </FormGroup>
    )
}

export default LocationCheckboxes