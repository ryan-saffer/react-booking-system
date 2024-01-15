import { Link } from 'react-router-dom'

import { useScopes } from '@components/Hooks/UseScopes'
import useFirebase from '@components/Hooks/context/UseFirebase'
import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import LogoutIcon from '@mui/icons-material/Logout'
import { AppBar, Button, Container, CssBaseline, Toolbar } from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

import styles from './navigation.module.css'

const PREFIX = 'Navigation'

const classes = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    main: `${PREFIX}-main`,
    paper: `${PREFIX}-paper`,
    logo: `${PREFIX}-logo`,
    heading: `${PREFIX}-heading`,
    signOutButton: `${PREFIX}-signOutButton`,
}

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
        position: 'sticky',
        top: 0,
    },

    [`& .${classes.toolbar}`]: {
        justifyContent: 'center',
    },

    [`& .${classes.main}`]: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(3),
        background: '#F0F2F5',
    },

    [`& .${classes.paper}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        padding: theme.spacing(2),
        '&:hover': {
            backgroundColor: grey[100],
            cursor: 'pointer',
        },
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.logo}`]: {
        height: 50,
    },

    [`& .${classes.heading}`]: {
        marginTop: 12,
    },

    [`& .${classes.signOutButton}`]: {
        width: '100%',
        marginTop: theme.spacing(4),
        // backgroundColor: red[400],
        '&:hover': {
            backgroundColor: '#051529',
            color: 'white',
        },
        height: 48,
        color: 'black',
    },
}))

export const Navigation = () => {
    const scopes = useScopes()
    const hasCoreScopes = scopes.CORE !== 'none'
    const isRestricted = scopes.CORE === 'restricted'
    const hasCoreWriteScope = scopes.CORE === 'write'
    const hasPayrollWriteScope = scopes.PAYROLL === 'write'

    const firebase = useFirebase()

    return (
        <Root sx={{ height: '100%' }}>
            <CssBaseline />
            <AppBar position="static" className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <img className={classes.logo} src={Logo.default} alt="Fizz Kidz Logo" />
                </Toolbar>
            </AppBar>
            <div className={classes.main}>
                <Container component="main" maxWidth="sm">
                    {hasCoreScopes && (
                        <>
                            <h2 className="lilita">Programs</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <ListItem
                                    title="Parties, Events & Incursions"
                                    to={ROUTES.BOOKINGS}
                                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/FizzKidz-76-scaled-e1645523582564-pkvrc29l4f5in86v327lhv2aavc71eult9zjc8i5cw.jpeg"
                                />
                                <ListItem
                                    title="Holiday Programs"
                                    to={ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS}
                                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/2022/03/FizzKidz-Summerhill-31-e1646805910671.jpeg"
                                />
                                <ListItem
                                    title="After School Program"
                                    to={ROUTES.AFTER_SCHOOL_PROGRAM_SELECT_CLASS}
                                    imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/Layer-8-p1e4mkgqstj3hgrx8atpwyesp9t7itb3hckcjgopls.jpg"
                                />
                            </div>
                            {!isRestricted && (
                                <>
                                    <h2 className="lilita">Creations</h2>
                                    <ListItem
                                        title="Creation Instructions"
                                        to={ROUTES.CREATIONS}
                                        imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/Sparkling-Lipbalm-1-p29wcmsmucie25b40xgtewic1carr2pe9ubfd1yvew.png"
                                    />
                                </>
                            )}
                            <h2 className="lilita">Useful Links</h2>
                            <ListItem
                                imgSrc="https://fizzkidz.com.au/wp-content/uploads/elementor/thumbs/FizzKidz-Summerhill-65-pw3n3aq1pb8clofid1rqavdu8dtp2qs8c4dle4xllk.jpeg"
                                title="Incident Reporting"
                                onClick={() =>
                                    window.open(
                                        'https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform',
                                        '_blank'
                                    )
                                }
                            />
                        </>
                    )}
                    {(hasCoreWriteScope || hasPayrollWriteScope) && (
                        <>
                            <h2 className="lilita">Admin</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {hasCoreWriteScope && (
                                    <ListItem
                                        title="After School Program Invoicing"
                                        to={ROUTES.AFTER_SCHOOL_PROGRAM_INVOICING_SELECT_CLASS}
                                        imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=envelope&scale=70&backgroundColor=E91171"
                                    />
                                )}
                                {hasPayrollWriteScope && (
                                    <ListItem
                                        title="Payroll"
                                        to={ROUTES.PAYROLL}
                                        imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=cashCoin&scale=70&backgroundColor=4BC5D9&translateY=5"
                                    />
                                )}
                                {hasCoreWriteScope && (
                                    <ListItem
                                        title="Onboarding"
                                        to={ROUTES.ONBOARDING}
                                        imgSrc="https://api.dicebear.com/7.x/icons/svg?icon=signpost2&scale=70&backgroundColor=9ECC48"
                                    />
                                )}
                            </div>
                        </>
                    )}

                    <Button
                        className={classes.signOutButton}
                        variant="outlined"
                        onClick={firebase.doSignOut}
                        endIcon={<LogoutIcon />}
                    >
                        Log out
                    </Button>
                </Container>
            </div>
        </Root>
    )
}

function ListItem({
    title,
    to,
    imgSrc,
    onClick,
}: {
    title: string
    to?: string
    imgSrc: string
    onClick?: () => void
}) {
    return (
        <Link to={to || ''} className={styles.listItem} onClick={onClick}>
            <img src={imgSrc} width={80} alt={`${title} icon`} />
            <h4 className="gotham">{title}</h4>
        </Link>
    )
}
