import { strictEqual } from 'assert'

import MockDate from 'mockdate'

import { getUpcoming } from './utils.party'

describe('Party Utils Suite', () => {
    it('Should get the correct upcoming date', () => {
        MockDate.set('2024-07-03T02:00:00.000Z') // Wednesday, 12pm AEST

        strictEqual(
            getUpcoming('Tuesday').toLocaleString('en-au', { timeZone: 'Australia/Melbourne' }),
            '09/07/2024, 12:00:00 am'
        )
        strictEqual(
            getUpcoming('Wednesday').toLocaleString('en-au', { timeZone: 'Australia/Melbourne' }),
            '10/07/2024, 12:00:00 am'
        ) // Wednesday 10th at midnight AEST
        strictEqual(
            getUpcoming('Thursday').toLocaleString('en-au', { timeZone: 'Australia/Melbourne' }),
            '04/07/2024, 12:00:00 am'
        ) // Thursdays 4th at midnight AEST
    })
})
