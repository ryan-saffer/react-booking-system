import React from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import * as Logo from '../../../../drawables/FizzKidzLogoHorizontal.png'
import * as ROUTES from '../../../../constants/routes'
import ScienceClubClassSelection from '../../shared/ScienceClubClassSelection'

const PREFIX = 'ScienceClubInvoicingClassSelection'

const cssClasses = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    title: `${PREFIX}-title`,
    logo: `${PREFIX}-logo`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${cssClasses.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${cssClasses.toolbar}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${cssClasses.title}`]: {
        marginRight: 'auto',
        flex: 1,
    },

    [`& .${cssClasses.logo}`]: {
        height: 50,
        cursor: 'pointer',
    },
}))

export const ScienceClubInvoicingClassSelection = () => {
    const navigate = useNavigate()

    return (
        <Root>
            <CssBaseline />
            <AppBar className={cssClasses.appBar} position="static">
                <Toolbar className={cssClasses.toolbar}>
                    <Typography className={cssClasses.title} variant="h6" color="inherit">
                        Invoicing - Science Club
                    </Typography>
                    <img
                        className={cssClasses.logo}
                        src={Logo.default}
                        onClick={() => navigate(ROUTES.LANDING)}
                        alt="Fizz Kidz Logo"
                    />
                </Toolbar>
            </AppBar>
            <ScienceClubClassSelection classRoute={ROUTES.SCIENCE_CLUB_INVOICING_STATUS} classRequired={false} />
        </Root>
    )
}
