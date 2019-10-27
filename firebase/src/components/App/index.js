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
import BookingForm from '../BookingForm'

const App = () => (
  <Router>
    <div>
      <Navigation />
      <hr />
      <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.BOOKINGS} component={BookingsPage} />
      <Route path={ROUTES.BOOKINGFORM} component={BookingForm} />
    </div>
  </Router>
);

export default App;