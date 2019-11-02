import React from 'react'
import { withFirebase } from '../Firebase'
import 'typeface-roboto'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { InputLabel, MenuItem, FormHelperText } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { validateFormOnChange, errorFound } from './baseBookingFormValidation'

export function handleBaseBookingFormChange(formValues, e) {
    const isDateField = e instanceof Date
    let field = isDateField ? 'date' : e.target.name
    let value = isDateField ? e : e.target.value
    let tmpValues = { ...formValues }
    tmpValues[field].value = value
    tmpValues = validateFormOnChange(tmpValues, field, value)

    // clear the value and errors of the address field if it is no longer required
    if (field === 'location' && value !== 'mobile') {
        tmpValues.address.value = ''
        tmpValues.address.error = false
    }
    
    return [!errorFound(tmpValues), tmpValues]
}

/** The booking form component */
const BaseBookingForm = props => {

    const { formValues, editing } = props
    const handleFormChange = props.onFormChange

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">
                    Parent details
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    id="parentFirstName"
                    name="parentFirstName"
                    label="Parent first name"
                    fullWidth
                    variant="outlined"
                    autoComplete='off'
                    disabled={!editing}
                    value={formValues.parentFirstName.value}
                    error={formValues.parentFirstName.error}
                    helperText={formValues.parentFirstName.error ? formValues.parentFirstName.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    id="parentLastName"
                    name="parentLastName"
                    label="Parent last name"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues.parentLastName.value}
                    error={formValues.parentLastName.error}
                    helperText={formValues.parentLastName.error ? formValues.parentLastName.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    id="parentEmail"
                    name="parentEmail"
                    label="Parent email"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues.parentEmail.value}
                    error={formValues.parentEmail.error}
                    helperText={formValues.parentEmail.error ? formValues.parentEmail.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                id="parentMobile"
                name="parentMobile"
                label="Parent mobile"
                fullWidth
                variant="outlined"
                disabled={!editing}
                value={formValues.parentMobile.value}
                error={formValues.parentMobile.error}
                helperText={formValues.parentMobile.error ? formValues.parentMobile.errorText : ''}
                onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6">
                    Child details
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    id="childName"
                    name="childName"
                    label="Child name"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues.childName.value}
                    error={formValues.childName.error}
                    helperText={formValues.childName.error ? formValues.childName.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    id="childAge"
                    name="childAge"
                    label="Child age"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues.childAge.value}
                    error={formValues.childAge.error}
                    helperText={formValues.childAge.error ? formValues.childAge.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6">
                    Date, time & location
                </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        fullWidth
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        id="date"
                        label="Date of party"
                        autoOk="true"
                        disabled={!editing}
                        value={formValues.date.value}
                        error={formValues.date.error}
                        helperText={formValues.date.error ? formValues.date.errorText : ''}
                        onChange={handleFormChange(formValues)}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    fullWidth
                    id="time"
                    name="time"
                    label="Party time"
                    type="time"
                    disabled={!editing}
                    value={formValues.time.value}
                    error={formValues.time.error}
                    helperText={formValues.time.error ? formValues.time.errorText : ''}
                    onChange={handleFormChange(formValues)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        step: 1800, // 5 min
                    }}
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <FormControl
                    fullWidth
                >
                <InputLabel>Location</InputLabel>
                    <Select
                        inputProps={{
                            name: 'location',
                            id: 'location',
                            value: formValues.location.value ? formValues.location.value : ''
                        }}
                        disabled={!editing}
                        error={formValues.location.error}
                        onChange={handleFormChange(formValues)}
                    >
                        <MenuItem value={'balwyn'}>Balwyn</MenuItem>
                        <MenuItem value={'malvern'}>Malvern</MenuItem>
                        <MenuItem value={'mobile'}>Mobile</MenuItem>
                </Select>
                {formValues.location.error ? (
                    <FormHelperText error={true}>{formValues.location.errorText}</FormHelperText>
                ) : null}
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>Party length</InputLabel>
                        <Select
                            inputProps={{
                                name: 'partyLength',
                                id: 'partyLength',
                                value: formValues.partyLength.value ? formValues.partyLength.value : ''
                            }}
                            disabled={!editing}
                            error={formValues.partyLength.error}
                            onChange={handleFormChange(formValues)}
                        >
                            <MenuItem value={'1'}>1 hour</MenuItem>
                            <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                            <MenuItem value={'2'}>2 hours</MenuItem>
                    </Select>
                    {formValues.partyLength.error ? (
                        <FormHelperText error={true}>{formValues.partyLength.errorText}</FormHelperText>
                    ) : null}
                    </FormControl>
                </Grid>
            {formValues.location.value === 'mobile' ? (
            <Grid item xs={12}>
                <TextField
                    id="address"
                    name="address"
                    label="Address"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues.address.value}
                    error={formValues.address.error}
                    helperText={formValues.address.error ? formValues.address.errorText : ''}
                    onChange={handleFormChange(formValues)}
                />
            </Grid>
            ) : null}
        </Grid>
    )
}

export default withFirebase(BaseBookingForm)