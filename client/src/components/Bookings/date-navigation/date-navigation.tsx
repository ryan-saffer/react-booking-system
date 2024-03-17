import { Location, capitalise } from 'fizz-kidz'
import { CalendarPlus } from 'lucide-react'
import { DateTime } from 'luxon'
import { FC, PropsWithChildren, useState } from 'react'

import { useAuth, useOrganization } from '@clerk/clerk-react'
import { useStickyNavbar } from '@components/root/use-sticky-navbar'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import {
    Box,
    Button,
    CssBaseline,
    Drawer,
    FormControl,
    Grid,
    Hidden,
    MenuItem,
    Select,
    useMediaQuery,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { StaticDatePicker } from '@mui/x-date-pickers'
import { Button as MyButton } from '@ui-components/button'

import { useScopes } from '../../Hooks/UseScopes'
import { LocationFilter } from '../location-filter/location-filter.context'
import { useLocationFilter } from '../location-filter/location-filter.hook'
import { DateNavigationContext } from './date-navigation.context'

const PREFIX = 'BookingsPage'

const classes = {
    root: `${PREFIX}-root`,
    drawer: `${PREFIX}-drawer`,
    drawerPaper: `${PREFIX}-drawerPaper`,
    content: `${PREFIX}-content`,
    appBar: `${PREFIX}-appBar`,
    appBarToolbar: `${PREFIX}-appBarToolbar`,
    logo: `${PREFIX}-logo`,
    topLeft: `${PREFIX}-topLeft`,
    topCenter: `${PREFIX}-topCenter`,
    authTopRight: `${PREFIX}-authTopRight`,
    noAuthTopRight: `${PREFIX}-noAuthTopRight`,
    logoutIcon: `${PREFIX}-logoutIcon`,
    toolbar: `${PREFIX}-toolbar`,
    inlineDatePicker: `${PREFIX}-inlineDatePicker`,
    location: `${PREFIX}-location`,
    dialogueAppBar: `${PREFIX}-dialogueAppBar`,
    divider: `${PREFIX}-divider`,
    paper: `${PREFIX}-paper`,
    layout: `${PREFIX}-layout`,
    dialog: `${PREFIX}-dialog`,
}

const StyledHeading = styled('h1')({})

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
        height: 'inherit',
        background: '#F0F2F5',
    },

    [`& .${classes.drawer}`]: {
        width: drawerWidth,
        flexShrink: 0,
        zIndex: 1,
    },

    [`& .${classes.drawerPaper}`]: {
        width: drawerWidth,
        border: 0,
    },

    [`& .${classes.content}`]: {
        flexGrow: 1,
        backgroundColor: '#F0F2F5',
        // padding: theme.spacing(3),
    },

    [`& .${classes.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${classes.logo}`]: {
        height: 50,
        cursor: 'pointer',
        position: 'absolute',
        left: '50%',
        right: '50%',
        transform: 'translate(-50%)',
    },

    [`& .${classes.topLeft}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-start',
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.topCenter}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'center',
    },

    [`& .${classes.authTopRight}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            width: 'auto',
        },
    },

    [`& .${classes.noAuthTopRight}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.logoutIcon}`]: {
        paddingTop: theme.spacing(1),
        paddingRight: '0px',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.toolbar}`]: theme.mixins.toolbar,
}))

type WithButton = {
    showButton: true
    buttonLabel: string
    onButtonPressed: () => void
}

type WithoutButton = {
    showButton: false
}

type Props = {
    label: string
} & (WithButton | WithoutButton)

function midnight(date: DateTime) {
    return date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
}

export const DateNavigation: FC<PropsWithChildren<Props>> = (props) => {
    const { showButton, children } = props

    const scopes = useScopes()
    // const writePermissions = scopes.CORE === 'write'
    const { has } = useAuth()
    const writePermissions = has?.({ permission: 'org:bookings:write' })
    console.log('write perms:', writePermissions)

    const [date, setDate] = useState(midnight(DateTime.now()))
    const [, setLoading] = useState(true)

    const handleDateChange = (date: DateTime) => {
        setDate(midnight(date))
    }

    const { selectedLocation, filterByLocation } = useLocationFilter()

    const wrapFilter = useMediaQuery('(max-width: 550px)')

    useStickyNavbar()

    return (
        <Root className={classes.root}>
            <CssBaseline />
            <Hidden mdDown>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="left"
                >
                    <div className={classes.toolbar} />
                    <StaticDatePicker
                        orientation="portrait"
                        value={date}
                        slotProps={{ actionBar: { actions: ['today'] } }}
                        onChange={(date) => handleDateChange(date!)}
                    />
                </Drawer>
            </Hidden>
            <Grid container>
                <Box className={classes.content} sx={{ padding: { xs: 2, md: 3 } }}>
                    <div className="mb-2 flex items-center justify-between">
                        <StyledHeading
                            className="lilita"
                            sx={{
                                marginBottom: 0,
                                marginTop: 0,
                                fontSize: {
                                    xs: 24,
                                    sm: 32,
                                },
                            }}
                        >
                            Parties, Events & Incursions
                        </StyledHeading>
                        {writePermissions && showButton && (
                            <MyButton className="twp" variant="outline" onClick={props.onButtonPressed}>
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                New Booking
                            </MyButton>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexDirection: wrapFilter ? 'column' : 'row' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 8,
                                flex: 2,
                            }}
                        >
                            <Button
                                onClick={() => handleDateChange(date.minus({ days: 1 }))}
                                sx={{
                                    background: 'white',
                                    borderRadius: 2,
                                    flexShrink: 2,
                                    ':hover': { border: '1px solid black' },
                                }}
                            >
                                <NavigateBefore />
                            </Button>
                            <MobileDatePicker
                                closeOnSelect
                                value={date}
                                sx={{ flexShrink: 1 }}
                                slotProps={{
                                    textField: {
                                        sx: {
                                            input: {
                                                textAlign: 'center',
                                                background: 'white',
                                                borderWidth: 0,
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                ':hover': {
                                                    background: '#E8EBED',
                                                    border: '1px solid black',
                                                    margin: '-1px',
                                                },
                                            },
                                            fieldSet: {
                                                borderWidth: 0,
                                            },
                                        },
                                        fullWidth: true,
                                    },
                                    actionBar: { actions: ['today'] },
                                }}
                                format="ccc, LLL d, y"
                                onChange={(date) => date && handleDateChange(date)}
                            />
                            <Button
                                onClick={() => handleDateChange(date.plus({ days: 1 }))}
                                sx={{
                                    background: 'white',
                                    borderRadius: 2,
                                    flexShrink: 2,
                                    ':hover': { border: '1px solid black' },
                                }}
                            >
                                <NavigateNext />
                            </Button>
                        </div>
                        <FormControl sx={{ background: 'white', flex: 1 }}>
                            <Select
                                value={selectedLocation}
                                onChange={(e) => filterByLocation(e.target.value as LocationFilter)}
                            >
                                <MenuItem value="all">
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <LocationOnOutlinedIcon sx={{ color: '#0f172a', width: 20, height: 20 }} />
                                        <div>All Locations</div>
                                    </div>
                                </MenuItem>
                                {Object.values(Location).map((location) => (
                                    <MenuItem key={location} value={location}>
                                        {capitalise(location)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <DateNavigationContext.Provider value={{ date, setDate: handleDateChange, setLoading }}>
                        {children}
                    </DateNavigationContext.Provider>
                </Box>
            </Grid>
        </Root>
    )
}

const drawerWidth = 320
