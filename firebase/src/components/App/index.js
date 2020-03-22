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
import ClassDetailsPage from '../ScienceClub/ClassDetails'
import { ThemeProvider } from '@material-ui/styles';
import { green } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core';
import { withAuthentication } from '../Session'

const App = () => {

  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#9be7ff',
        main: '#64b5f6',
        dark: '#2286c3',
        contrastText: '#000000',
      },
      secondary: {
        light: '#ffc4ff',
        main: '#ce93d8',
        dark: '#9c64a6',
        contrastText: '#000000',
      }
    },
    overrides: {
      MuiCheckbox: {
        colorPrimary: green
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
            <Route exact path={ROUTES.SCIENCE_CLUB_CLASS_DETAILS} component={ClassDetailsPage} />
            <Route path={ROUTES.BOOKINGS} component={BookingsPage} />
          </div>
        </Router>
    </ThemeProvider>
  )
  
}

export default withAuthentication(App)