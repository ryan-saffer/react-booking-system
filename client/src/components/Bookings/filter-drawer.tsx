import { Location, capitalise } from 'fizz-kidz'

import CakeIcon from '@mui/icons-material/Cake'
import StadiumIcon from '@mui/icons-material/Stadium'
import {
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Switch,
    useMediaQuery,
} from '@mui/material'

export const FilterDrawer = ({
    open,
    handleClose,
    showParties,
    toggleShowParties,
    showEvents,
    toggleShowEvents,
    selectedLocations,
    setLocation,
}: {
    open: boolean
    handleClose: () => void
    showParties: boolean
    toggleShowParties: () => void
    showEvents: boolean
    toggleShowEvents: () => void
    selectedLocations: { [key in Location]: boolean }
    setLocation: (location: Location, value: boolean) => void
}) => {
    const showFullScreenVersion = useMediaQuery('(max-width: 860px)')
    const isMobile = useMediaQuery('(max-width: 550px)')
    return (
        <Drawer
            open={open}
            anchor="top"
            onClose={handleClose}
            PaperProps={{
                sx: {
                    marginTop: isMobile ? 7 : 8,
                    marginLeft: showFullScreenVersion ? 0 : '25%',
                    marginRight: showFullScreenVersion ? 0 : '25%',
                },
            }}
        >
            <List subheader={<ListSubheader>Programs</ListSubheader>}>
                <ListItem>
                    <ListItemIcon>
                        <CakeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Parties" />
                    <Switch edge="end" color="secondary" checked={showParties} onChange={toggleShowParties} />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <StadiumIcon />
                    </ListItemIcon>
                    <ListItemText primary="Events" />
                    <Switch edge="end" color="secondary" checked={showEvents} onChange={toggleShowEvents} />
                </ListItem>
                <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
                <ListSubheader>Locations</ListSubheader>
                {Object.values(Location).map((location) => (
                    <ListItem key={location}>
                        <ListItemText primary={capitalise(location)} />
                        <Switch
                            edge="end"
                            color="secondary"
                            checked={selectedLocations[location]}
                            onChange={(e) => setLocation(location, e.target.checked)}
                        />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    )
}
