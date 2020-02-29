import React from 'react'
import { Link } from 'react-router-dom'

import SignOutButton from '../SignOut'
import * as ROUTES from '../../constants/routes'

const Navigation = () => (
    <div>
        <ul>
            <li>
                <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </li>
            <li>
                <Link to={ROUTES.BOOKINGS}>Bookings</Link>
            </li>
            <li>
                <Link to={ROUTES.SCIENCE_CLUB_SELECT_CLASS}>Science Club</Link>
            </li>
            <li>
                <SignOutButton />
            </li>
        </ul>
    </div>
)

export default Navigation