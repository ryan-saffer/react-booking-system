import {
    AppBar,
    CssBaseline,
    Dialog,
    IconButton,
    makeStyles,
    Paper,
    Slide,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Close as CloseIcon } from '@material-ui/icons'
import { TransitionProps } from '@material-ui/core/transitions'
import React, { ReactElement, Ref, useState } from 'react'
import NewBookingForm from './Forms/NewBookingForm'
import EventForm from './Forms/EventForm'

type Props = {
    open: boolean
    onBookingCreated: (date?: Date) => void
}

const Transition = React.forwardRef(
    (props: TransitionProps & { children?: ReactElement<any, any> }, ref: Ref<unknown>) => (
        <Slide direction="up" ref={ref} {...props} />
    )
)

const NewBookingDialog: React.FC<Props> = ({ open, onBookingCreated }) => {
    const classes = useStyles()

    // used to ensure form mounts on each open. See https://github.com/reactjs/react-modal/issues/106#issuecomment-546658885
    const [key, setKey] = useState(0)
    const [value, setValue] = useState(0)

    function handleBookingCreated(date?: Date) {
        setKey(key + 1)
        onBookingCreated(date)
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => handleBookingCreated()}
            TransitionComponent={Transition}
            disableAutoFocus={true}
            PaperProps={{ classes: { root: classes.dialog } }}
        >
            <CssBaseline />
            <AppBar position="absolute" className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => handleBookingCreated()} aria-label="close">
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
                    {value === 1 && <EventForm />}
                </Paper>
            </main>
        </Dialog>
    )
}

const useStyles = makeStyles((theme) => ({
    layout: {
        width: 'auto',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(2) * 2)]: {
            width: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    dialog: {
        backgroundColor: grey[200],
    },
    appBar: {
        position: 'relative',
    },
    paper: {
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
}))

export default NewBookingDialog
