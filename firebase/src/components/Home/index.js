import React, { useState } from 'react';
import { withFirebase } from '../Firebase/context'
import Fab from '@material-ui/core/Fab';
import AddCircle from '@material-ui/icons/AddCircle'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import BookingForm from '../BookingForm'
import CssBaseline from '@material-ui/core/CssBaseline'
import Paper from '@material-ui/core/Paper';
import { grey } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
    fab: {
        margin: '0',
        top: 'auto',
        right: '20',
        bottom: '20',
        left: 'auto',
        position: 'fixed'
    },
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
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
    paper: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
    stepper: {
        padding: theme.spacing(3, 0, 5),
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    button: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(1),
    },
    dialog: {
        backgroundColor: grey[200]
    }
}))

const Transition = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
))

const HomePage = (props) => {

    const classes = useStyles()

    const { firebase } = props

    const [openNewBooking, setOpenNewBooking] = useState(false)
    // used to ensure form mounts on each open. See https://github.com/reactjs/react-modal/issues/106#issuecomment-546658885
    const [key, setKey] = useState(0)

    const handleOpenNewBooking = () => {
        setOpenNewBooking(true)
    }

    const handleCloseBooking = newBookingId => {
        console.log(newBookingId)
        setKey(key + 1)
        setOpenNewBooking(false)
    }

    return (
        <>
            <Fab className={classes.fab}
                color="primary"
                onClick={handleOpenNewBooking}>
                <AddCircle />
            </Fab>
                <Dialog
                    fullScreen
                    open={openNewBooking}
                    onClose={handleCloseBooking}
                    TransitionComponent={Transition}
                    disableAutoFocus={true}
                    PaperProps={{ classes: { root: classes.dialog } }}
                >
                <CssBaseline />
                <AppBar position='absolute' className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleCloseBooking} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            New Booking
                    </Typography>
                    </Toolbar>
                </AppBar>
                <main key={key} className={classes.layout}>
                    <Paper className={classes.paper}>
                        <BookingForm onSuccess={handleCloseBooking} />
                    </Paper>
                </main>
                </Dialog>
        </>
    )
}

export default withFirebase(HomePage)