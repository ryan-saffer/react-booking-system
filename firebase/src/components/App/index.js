import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Navigation from '../Navigation'
import SignInPage from '../SignIn'
import * as ROUTES from '../../constants/routes'
import BookingsPage from '../Bookings'
import ScienceClubClassSelectionPage from '../ScienceClub/Checkin/SelectClass'
import ScienceClubClassDetails from '../ScienceClub/Checkin/ClassDetails'
import ScienceClubAdminClassSelection from '../ScienceClub/Invoicing/SelectClass'
import InvoiceStatusPage from '../ScienceClub/Invoicing/InvoiceStatusPage';
import HolidayProgramSelection from '../HolidayPrograms/SelectClass'
import HolidayProgramClassDetails from '../HolidayPrograms/ClassDetails'
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { withAuthentication } from '../Session'
import EnrolmentPage from '../ScienceClub/Enrolment';
import HolidayProgramBookingScreen from '../HolidayPrograms/CustomerBookingScreen';
import Confirmation from '../HolidayPrograms/CustomerBookingScreen/confirmation/Confirmation';

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
            <Route exact path={ROUTES.SCIENCE_CLUB_SELECT_CLASS} component={ScienceClubClassSelectionPage} />
            <Route exact path={ROUTES.SCIENCE_CLUB_CLASS_DETAILS} component={ScienceClubClassDetails} />
            <Route exact path={ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS} component={ScienceClubAdminClassSelection} />
            <Route exact path={ROUTES.SCIENCE_CLUB_INVOICING_STATUS} component={InvoiceStatusPage} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS} component={HolidayProgramSelection} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_CLASS_DETAILS} component={HolidayProgramClassDetails} />
            <Route path={ROUTES.BOOKINGS} component={BookingsPage} />
            <Route exact path={ROUTES.SCIENCE_CLUB_ENROLMENT} component={EnrolmentPage} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_CUSTOMER_BOOKING_SCREEN} component={HolidayProgramBookingScreen} />
            <Route exact path={ROUTES.HOLIDAY_PROGRAM_CUSTOMER_CONFIRMATION_SCREEN} component={Confirmation} />
          </div>
        </Router>
    </ThemeProvider>
  )
  
}

export default withAuthentication(App)