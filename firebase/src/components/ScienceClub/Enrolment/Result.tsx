import React from 'react'
import { Container, Divider, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import ErrorIcon from '@material-ui/icons/Error'
import CheckCircleTwoTone from '@material-ui/icons/CheckCircleTwoTone'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'

type ResultType = 'success' | 'error'

interface ResultProps {
    label: string
    resultType: ResultType
}

const Result: React.FC<ResultProps> = ({ label, resultType, children }) => {
    const classes = useStyles()

    return (
        <>
            <Container maxWidth="md">
                <Grid container justify="center">
                    <Grid className={classes.gridItem} item sm={6}>
                        <Typography className={classes.error} variant="h4">
                            {label}
                        </Typography>
                        {resultType === 'error' && <ErrorIcon className={classes.errorIcon} />}
                        {resultType === 'success' && <CheckCircleTwoTone className={classes.successIcon} />}
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
    <Result label="Whoopsy daisy... 🤦‍♀️" resultType="error">
        <Typography variant="h5" gutterBottom>
            Something went wrong
        </Typography>
        <Typography variant="body1" gutterBottom>
            It looks like we had a problem processing your request.
        </Typography>
        <Typography variant="body1" gutterBottom>
            Please either reply to our email, or call to let us know if you would like to continue with the term.
        </Typography>
        <Typography variant="button" gutterBottom>
            The Fizz Kidz team
        </Typography>
    </Result>
)

interface SuccessProps {
    continuing: Acuity.Client.ContinuingOption
    appointment: ScienceEnrolment
}

export const Success: React.FC<SuccessProps> = ({ continuing, appointment }) => {
    function renderContinuingCopy() {
        return (
            <>
                <Typography variant="h5" gutterBottom>
                    Hi {appointment.parent.firstName},
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {appointment.child.firstName}'s enrolment in the term has been confirmed.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We are thrilled to have {appointment.child.firstName} part of the science program! We will send you
                    an invoice for the term shortly.
                </Typography>
                <Typography variant="button" gutterBottom>
                    The Fizz Kidz team
                </Typography>
            </>
        )
    }

    function renderNotContinuingCopy() {
        return (
            <>
                <Typography variant="h5" gutterBottom>
                    Hi {appointment.parent.firstName},
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We're sad to see {appointment.child.firstName} go!
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {appointment.child.firstName} will be unenrolled from the term program.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We hope to see you again soon!
                </Typography>
                <Typography variant="button" gutterBottom>
                    The Fizz Kidz team
                </Typography>
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
        justifyContent: 'center',
    },
    error: {
        alignSelf: 'center',
    },
    successIcon: {
        height: 60,
        width: 60,
        alignSelf: 'center',
        color: 'green',
        marginTop: 15,
        marginBottom: 15,
    },
    errorIcon: {
        height: 60,
        width: 60,
        alignSelf: 'center',
        color: 'crimson',
        marginTop: 15,
        marginBottom: 15,
    },
    paper: {
        padding: 32,
    },
    divider: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 40,
        width: '80%',
    },
})
