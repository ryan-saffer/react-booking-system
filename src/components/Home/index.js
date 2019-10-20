import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { withFirebase } from '../Firebase/context'
import { TextField, Select } from 'final-form-material-ui';
import {
  Typography,
  Paper,
  Link,
  Grid,
  Button,
  CssBaseline,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
// Picker
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  TimePicker,
  DatePicker,
} from 'material-ui-pickers';

const useStyles = makeStyles(theme => ({
    container: {
        padding: 16,
        maxWidth: 600,
        margin: 'auto'
    }
}))

function DatePickerWrapper(props) {
  const {
    input: { name, onChange, value, ...restInput },
    meta,
    ...rest
  } = props;
  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    meta.touched;

  return (
    <DatePicker
      {...rest}
      name={name}
      helperText={showError ? meta.error || meta.submitError : undefined}
      error={showError}
      inputProps={restInput}
      onChange={onChange}
      value={value === '' ? null : value}
    />
  );
}

function TimePickerWrapper(props) {
  const {
    input: { name, onChange, value, ...restInput },
    meta,
    ...rest
  } = props;
  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    meta.touched;

  return (
    <TimePicker
      {...rest}
      name={name}
      helperText={showError ? meta.error || meta.submitError : undefined}
      error={showError}
      inputProps={restInput}
      onChange={onChange}
      value={value === '' ? null : value}
    />
  );
}

const validate = values => {
    const errors = {};
    if (!values.parentName) {
        errors.parentName = 'Required';
    }
    if (!values.parentNumber) {
        errors.parentNumber = 'Required';
    }
    if (!values.parentEmail) {
        errors.parentEmail = 'Required';
    }
    if (!values.childName) {
        errors.childName = 'Required'
    }
    if (!values.childAge) {
        errors.childAge = 'Required'
    }
    if (!values.date) {
        errors.date = 'Required'
    }
    if (!values.time) {
        errors.time = 'Required'
    }
    if (!values.location) {
        errors.location = 'Required'
    }
    if (!values.length) {
        errors.length = 'Required'
    }
    return errors;
};

const HomePage = (props) => {

    const classes = useStyles()
    const [result, setResult] = useState(null)

    const { firebase } = props

    const onSubmit = async values => {
        
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        await sleep(300);
        console.log(props)
        props.firebase.db.collection('bookings').document().set({...values});
        window.alert(JSON.stringify(values, 0, 2));
    };

    const handleTest = () => {
        const helloWorld = firebase.functions.httpsCallable('helloWorld')
        helloWorld({ auth: firebase.auth.currentUser.toJSON() })
            .then(result => {
                console.log(result.data)
                setResult(result.data)
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                console.log('finally')
            })
    }

    return (
        <div className={classes.container}>
        <CssBaseline />
        <Typography variant="h4" align="center" component="h1" gutterBottom>
            Fizz Kidz Booking Form
        </Typography>
        <Typography paragraph align="center">
            <Link href="https://github.com/erikras/react-final-form#-react-final-form">
            Read Docs
            </Link>
            . This example demonstrates using{' '}
            <Link href="https://material-ui.com/demos/text-fields/">
            Material-UI
            </Link>{' '}
            form controls.
        </Typography>
        <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, reset, submitting, pristine, values }) => (
            <form onSubmit={handleSubmit} noValidate>
                <Paper style={{ padding: '6px 16px 6px 16px' }}>
                <Grid container alignItems="flex-start" spacing={4}>
                    <Grid item xs={12}>
                        <Typography variant="h5">Booking Form</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            fullWidth
                            required
                            name="parentName"
                            component={TextField}
                            type="text"
                            label="Parent Name"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            fullWidth
                            required
                            name="parentNumber"
                            component={TextField}
                            type="text"
                            label="Mobile Number"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            name="parentEmail"
                            fullWidth
                            required
                            component={TextField}
                            type="email"
                            label="Email"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            fullWidth
                            required
                            name="childName"
                            component={TextField}
                            type="text"
                            label="Child Name"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            fullWidth
                            required
                            name="childAge"
                            component={TextField}
                            type="number"
                            label="Child Age"
                        />
                    </Grid>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid item xs={6}>
                        <Field
                        required
                        name="date"
                        component={DatePickerWrapper}
                        fullWidth
                        margin="normal"
                        label="Date"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                        required
                        name="time"
                        component={TimePickerWrapper}
                        fullWidth
                        margin="normal"
                        label="Time"
                        />
                    </Grid>
                    </MuiPickersUtilsProvider>
                    <Grid item xs={6}>
                    <Field
                        required
                        name="location"
                        component={Select}
                        label="Party Location"
                        formControlProps={{ fullWidth: true }}
                    >
                        <MenuItem value="Malvern">Malvern</MenuItem>
                        <MenuItem value="Balwyn">Balwyn</MenuItem>
                        <MenuItem value="Mobile">Mobile</MenuItem>
                    </Field>
                    </Grid>
                    <Grid item xs={6}>
                    <Field
                        required
                        name="length"
                        component={Select}
                        label="Party Length"
                        formControlProps={{ fullWidth: true }}
                    >
                        <MenuItem value="1">1 Hour</MenuItem>
                        <MenuItem value="1.5">1.5 Hours</MenuItem>
                        <MenuItem value="2">2 Hours</MenuItem>
                    </Field>
                    </Grid>
                    <Grid item xs={12}>
                    <Field
                        fullWidth
                        name="notes"
                        component={TextField}
                        multiline
                        label="Notes"
                    />
                    </Grid>
                    <Grid item style={{ marginTop: 16 }}>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={reset}
                        disabled={submitting || pristine}
                    >
                        Reset
                    </Button>
                    </Grid>
                    <Grid item style={{ marginTop: 16 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={submitting}
                    >
                        Submit
                    </Button>
                    </Grid>
                </Grid>
                </Paper>
                <pre>{JSON.stringify(values, 0, 2)}</pre>
            </form>
            )}
        />
        <Button
            onClick={handleTest}
        >
            My Button
        </Button>
        <div>
            {result}
        </div>
        </div>
    );
}

export default withFirebase(HomePage)