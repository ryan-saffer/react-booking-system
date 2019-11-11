import React from 'react'
import { withFirebase } from '../Firebase'
import DateFnsUtils from '@date-io/date-fns'
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import { MuiPickersUtilsProvider } from '@material-ui/core/styles'

const AdditionalBookingDetails = () => {


    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography>Party Details</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl
                        fullWidth
                    >
                        <InputLabel>First creation</InputLabel>
                        <Select
                            inputProps={{
                                name: 'creation1',
                                id: 'creation1',
                                value: ''
                            }}
                        >
                            <MenuItem value={'glitter_slime'}>Glitter Slime</MenuItem>
                            <MenuItem value={'fluffy_slime'}>Fluffy Slime</MenuItem>
                            <MenuItem value={'bath_bombs'}>Bath Bombs</MenuItem>
                    </Select>
                    </FormControl>
            </Grid>
        </Grid>
    )
}

export default withFirebase(AdditionalBookingDetails)