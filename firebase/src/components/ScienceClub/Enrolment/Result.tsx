import React from 'react'
import { Container, Divider, Grid, Paper, Typography } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleTwoTone from '@mui/icons-material/CheckCircleTwoTone'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import styles from './Result.module.css'

type ResultType = 'success' | 'error'

interface ResultProps {
    label: string
    resultType: ResultType
}

const Result: React.FC<ResultProps> = ({ label, resultType, children }) => {
    return (
        <>
            <Container maxWidth="md">
                <Grid container justifyContent="center">
                    <Grid className={styles.gridItem} item sm={6}>
                        <Typography className={styles.error} variant="h4">
                            {label}
                        </Typography>
                        {resultType === 'error' && <ErrorIcon className={styles.errorIcon} />}
                        {resultType === 'success' && <CheckCircleTwoTone className={styles.successIcon} />}
                    </Grid>
                    <Grid className={styles.gridItem} item sm={6}>
                        <Paper className={styles.paper} elevation={3}>
                            {children}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Divider className={styles.divider} />
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
