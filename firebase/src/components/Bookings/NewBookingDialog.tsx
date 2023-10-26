import { AppBar, CssBaseline, Dialog, IconButton, Paper, Slide, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { grey } from '@mui/material/colors'
import { Close as CloseIcon } from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'
import React, { ReactElement, Ref, useState } from 'react'
import NewBookingForm from './Forms/NewBookingForm'
import NewEventForm from './Forms/EventForm/NewEventForm'

const PREFIX = 'NewBookingDialog'

const classes = {
    layout: `${PREFIX}-layout`,
    dialog: `${PREFIX}-dialog`,
    appBar: `${PREFIX}-appBar`,
    paper: `${PREFIX}-paper`,
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.layout}`]: {
        width: 'auto',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(800 + parseInt(theme.spacing(2).substring(-2)) * 2)]: {
            width: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },

    [`& .MuiDialog-paper`]: {
        backgroundColor: grey[200],
    },

    [`& .${classes.appBar}`]: {
        position: 'relative',
    },

    [`& .${classes.paper}`]: {
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + parseInt(theme.spacing(3).substring(-2)) * 2)]: {
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
}))

type Props = {
    open: boolean
    onBookingCreated: (date?: Date) => void
}

const Transition = React.forwardRef(
    (
        props: TransitionProps & {
            children: ReactElement<any, any>
        },
        ref: Ref<unknown>
    ) => <Slide direction="up" ref={ref} {...props} />
)

const NewBookingDialog: React.FC<Props> = ({ open, onBookingCreated }) => {
    // used to ensure form mounts on each open. See https://github.com/reactjs/react-modal/issues/106#issuecomment-546658885
    const [key, setKey] = useState(0)
    const [value, setValue] = useState(0)

    function handleBookingCreated(date?: Date) {
        setKey(key + 1)
        onBookingCreated(date)
    }

    return (
        <StyledDialog
            fullScreen
            open={open}
            onClose={() => handleBookingCreated()}
            TransitionComponent={Transition}
            disableAutoFocus={true}
            slotProps={{}}
        >
            <CssBaseline />
            <AppBar position="absolute" className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => handleBookingCreated()}
                        aria-label="close"
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                        New Booking
                    </Typography>
                </Toolbar>
            </AppBar>
            <main key={key} className={classes.layout}>
                <Tabs value={value} onChange={(_, value) => setValue(value)} variant="fullWidth">
                    <Tab label="Party Booking" />
                    <Tab label="Event Booking" />
                </Tabs>
                <Paper className={classes.paper}>
                    {value === 0 && <NewBookingForm onSuccess={handleBookingCreated} />}
                    {value === 1 && <NewEventForm onSuccess={handleBookingCreated} />}
                </Paper>
            </main>
        </StyledDialog>
    )
}

export default NewBookingDialog
