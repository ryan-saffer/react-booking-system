import { useNavigate } from 'react-router-dom'

import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import AfterSchoolProgramClassSelection from '../../shared/after-school-program-class-selection'

const PREFIX = 'AfterSchoolProgramInvoicingClassSelection'

const cssClasses = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    title: `${PREFIX}-title`,
    logo: `${PREFIX}-logo`,
}

const Root = styled('div')(({ theme }) => ({
    [`& .${cssClasses.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${cssClasses.toolbar}`]: {
        display: 'flex',
    },

    [`& .${cssClasses.title}`]: {
        marginRight: 'auto',
        flex: 1,
    },

    [`& .${cssClasses.logo}`]: {
        height: 50,
        cursor: 'pointer',
        position: 'absolute',
        left: '50%',
        right: '50%',
        transform: 'translate(-50%)',
    },
}))

export const AfterSchoolProgramInvoicingClassSelection = () => {
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
            <AfterSchoolProgramClassSelection
                classRoute={ROUTES.AFTER_SCHOOL_PROGRAM_INVOICING_STATUS}
                classRequired={false}
            />
        </Root>
    )
}
