import React from 'react'
import { Container, Divider, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import ErrorIcon from '@material-ui/icons/Error'
import CheckCircleTwoTone from '@material-ui/icons/CheckCircleTwoTone'
import { Acuity } from 'fizz-kidz/lib'
import { retrieveFormAndField } from 'fizz-kidz/lib/acuity/utilities'

type ResultType = "success" | "error"

interface ResultProps {
    label: string,
    resultType: ResultType
}

const Result: React.FC<ResultProps> = ({ label, resultType, children }) => {

    const classes = useStyles()

    return (
        <>
            <Container maxWidth="md">
                <Grid container justify="center">
                    <Grid className={classes.gridItem} item sm={6}>
                        <Typography className={classes.error} variant="h4">{label}</Typography>
                        {resultType === "error" && <ErrorIcon className={classes.errorIcon} />}
                        {resultType === "success" && <CheckCircleTwoTone className={classes.successIcon} />}
                    </Grid>
                    <Grid className={classes.gridItem} item sm={6}>
                        <Paper className={classes.paper} elevation={3}>
                            {children}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Divider className={classes.divider} />
        </>
    )
}

export const Error = () => (
    <Result label="Whoopsies... 🤦‍♀️" resultType="error">
        <Typography variant="h5" gutterBottom>Something went wrong</Typography>
        <Typography variant="body1" gutterBottom >It looks like we had a problem processing your request.</Typography>
        <Typography variant="body1" gutterBottom>Please either reply to our email, or call to let us know if you would like to continue with the term.</Typography>
        <Typography variant="button" gutterBottom>The Fizz Kidz team</Typography>
    </Result>
)

interface SuccessProps {
    continuing: Acuity.Client.ContinuingOption
    appointments: Acuity.Appointment[]
}

export const Success: React.FC<SuccessProps> = ({ continuing, appointments }) => {

    const appointment = appointments[0]
    const childName = retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)

    function renderContinuingCopy() {
        return (
            <>
                <Typography variant="h5" gutterBottom>Hi {appointment.firstName},</Typography>
                <Typography variant="body1" gutterBottom >{childName}'s enrolment in the term has been confirmed.</Typography>
                <Typography variant="body1" gutterBottom>{childName} can continue coming every week, and we will send you an invoice for the term.</Typography>
                <Typography variant="body1" gutterBottom>We can't wait to continue the science adventure!</Typography>
                <Typography variant="button" gutterBottom>The Fizz Kidz team</Typography>
            </>
        )
    }

    function renderNotContinuingCopy() {
        return (
            <>
                <Typography variant="h5" gutterBottom>Hi {appointment.firstName},</Typography>
                <Typography variant="body1" gutterBottom>We are sad to see {childName} go!</Typography>
                <Typography variant="body1" gutterBottom>{childName} will be completely unenrolled from the term.</Typography>
                <Typography variant="body1" gutterBottom>We hope to see you again soon!</Typography>
                <Typography variant="button" gutterBottom>The Fizz Kidz team</Typography>
            </>
        )
    }

    return (
        <Result label="Confirmed" resultType="success">
            {continuing === 'yes' && renderContinuingCopy()}
            {continuing === 'no' && renderNotContinuingCopy()}
        </Result>
    )
}

const useStyles = makeStyles({
    gridItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center"
    },
    error: {
        alignSelf: 'center'
    },
    successIcon: {
        height: 60,
        width: 60,
        alignSelf: 'center',
        color: 'green',
        marginTop: 15,
        marginBottom: 15
    },
    errorIcon: {
        height: 60,
        width: 60,
        alignSelf: 'center',
        color: 'crimson',
        marginTop: 15,
        marginBottom: 15
    },
    paper: {
        padding: 32,
    },
    divider: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        width: '80%'
    }
})