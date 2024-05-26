import { Location } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { ZohoClient } from '../zoho/zoho-client'

export async function zohoTest() {
    const zohoClient = new ZohoClient()

    try {
        await zohoClient.addHolidayProgramContact({
            firstName: 'Ryan',
            lastName: 'Saffer',
            email: 'ryansaffer@gmail.com',
            childName: 'Marlee',
            childBirthdayISO: DateTime.now().minus({ days: 4 }).toISO(),
            studio: Location.BALWYN,
        })
    } catch (err) {
        console.log(err)
    }
}
