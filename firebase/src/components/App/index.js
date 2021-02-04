import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Navigation from '../Navigation'
import SignInPage from '../SignIn'
import * as ROUTES from '../../constants/routes'
import BookingsPage from '../Bookings'
import SelectClassPage from '../ScienceClub/SelectClass'
import ScienceClubClassDetails from '../ScienceClub/ClassDetails'
import HolidayProgramSelection from '../HolidayPrograms/SelectClass'
import HolidayProgramClassDetails from '../HolidayPrograms/ClassDetails'
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { withAuthentication } from '../Session'

const App = () => {

  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#515051',
        main: '#292829',
        dark: '#000000',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#e576c3',
        main: '#B14592',
        dark: '#7f0c64',
        contrastText: '#FFFFFF',
      }
    }
  })

  return (
    <ThemeProvider theme={theme}>
        <Router>
          <div>
            <Route exact path={ROUTES.LANDING} component={Navigation} />
            <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route exact path={ROUTES.SCIENCE_CLUB_SELECT_CLASS} component={SelectClassPage} />
            <Route exact path={ROUTES.SCIENCE_CLUB_CLASS_DETAILS} component={ScienceClubClassDetails} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS} component={HolidayProgramSelection} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS} component={HolidayProgramClassDetails} />
            <Route path={ROUTES.BOOKINGS} component={BookingsPage} />
          </div>
        </Router>
    </ThemeProvider>
  )
  
}

export default withAuthentication(App)