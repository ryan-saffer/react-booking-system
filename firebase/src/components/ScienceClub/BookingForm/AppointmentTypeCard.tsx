import { Grow, makeStyles, Slide } from '@material-ui/core'
import { Card } from 'antd'
import { Acuity, Calendar } from 'fizz-kidz'
import React from 'react'

type Props = {
    appointmentType: Acuity.AppointmentType
    logoUrl: string
    onClick: () => void
}

const AppointmentTypeCard = React.forwardRef<HTMLDivElement, Props>(({ appointmentType, logoUrl, onClick }, ref) => {
    const classes = useStyles()

    return (
        <Grow in>
            <Card ref={ref} className={classes.card} onClick={onClick}>
                <div className={classes.heading}>
                    <strong>{appointmentType.name}</strong>
                </div>
                <div className={classes.detailsContainer}>
                    <div className={classes.description}>
                        {appointmentType.description.split('\n').map((line) => (
                            <p key={line}>{line}</p>
                        ))}
                    </div>
                    <img className={classes.logo} src={logoUrl} />
                </div>
            </Card>
        </Grow>
    )
})

const useStyles = makeStyles((theme) => ({
    card: {
        fontSize: 14,
        width: '100%',
        marginTop: 4,
        marginBottom: 4,
        '&:hover': {
            background: 'whitesmoke',
        },
    },
    detailsContainer: {
        display: 'flex',
        [theme.breakpoints.up('xs')]: {
            justifyContent: 'space-between',
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    mobileDetailsContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    heading: {
        marginBottom: 16,
    },
    description: {
        display: 'flex',
        flexDirection: 'column',
        '& p': {
            marginBottom: 0,
        },
    },
    logo: {
        height: 'fit-content',
        width: 'fit-content',
        maxWidth: 125,
        [theme.breakpoints.down('xs')]: {
            marginTop: 12,
        },
    },
}))

export default AppointmentTypeCard
