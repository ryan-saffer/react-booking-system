import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Navigation from '../Navigation'
import SignInPage from '../SignIn'
import HomePage from '../Home'
import * as ROUTES from '../../constants/routes'
import BookingsPage from '../Bookings'
import { ThemeProvider } from '@material-ui/styles';
import { green } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core';

const App = () => {

  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#f6e0ff',
        main: '#c3aef4',
        dark: '#927fc1',
        contrastText: '#fff',
      },
      secondary: {
        light: '#7cffff',
        main: '#34e4f2',
        dark: '#00b1bf',
        contrastText: '#fff',
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
          <Route path={ROUTES.HOME} component={HomePage} />
          <Route path={ROUTES.BOOKINGS} component={BookingsPage} />
        </div>
      </Router>
    </ThemeProvider>
  )
  
}

export default App;