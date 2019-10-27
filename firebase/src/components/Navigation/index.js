import React from 'react'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'

const Navigation = () => (
    <div>
        <ul>
            <li>
                <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </li>
            <li>
                <Link to={ROUTES.HOME}>Home</Link>
            </li>
            <li>
                <Link to={ROUTES.BOOKINGS}>Bookings</Link>
            </li>
            <li>
                <Link to={ROUTES.BOOKINGFORM}>Booking Form</Link>
            </li>
        </ul>
    </div>
)

export default Navigation