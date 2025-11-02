import '../load-env'

import { STUDIOS } from 'fizz-kidz'
import { DateTime } from 'luxon'
import prompts from 'prompts'

import { updateSlingWages } from '@/sling/update-sling-wages'

import { getAfterSchoolProgramAnaphylaxisPlanSignedUrl } from './after-school-program/get-after-school-program-anaphylaxis-plan-signed-url'
import { getAllUsers } from './auth/get-all-users'
import { deleteEvents } from './events/delete-events'
import {
    migrateScienceEnrolments,
    migration_addChildSupportToAllExistingEnrolments,
} from './migrations/after-school-program'
import { deleteFromLegacy, groupEventsByContactEmail, migrateLegacyEvents } from './migrations/events'
import { addFoodPackageToAllParties } from './migrations/parties-self-catering'
import { generatePartyFormUrl } from './parties/generate-form'
import { getSelfCateredPartiesByNotes } from './parties/get-self-catered-parties-by-notes'
import { updatePartiesToOldPrices } from './parties/update-parties-to-old-prices'
import { getEvents } from './reports/get-events'
import { getHolidayPrograms } from './reports/get-holiday-programs'
import { getParties } from './reports/get-parties'
import { getPlayLabPrograms } from './reports/get-play-lab'

;

(async () => {
    const { script } = await prompts({
        type: 'select',
        name: 'script',
        message: 'Select script to run',
        choices: [
            {
                title: 'Run report on bookings',
                value: 'runBookingsReport',
            },
            {
                title: 'Get party bookings',
                value: 'getParties',
            },
            {
                title: 'Delete Events By Email',
                value: 'deleteEventsByEmail',
            },
            {
                title: 'List all users',
                value: 'listAllUsers',
            },
            {
                title: 'Update Sling Wages',
                value: 'updateSlingWages',
            },
            {
                title: 'Update all bookings to old prices',
                value: 'updatePartiesToOldPrices',
            },
            {
                title: 'Generate party form URL',
                value: 'generatePartyFormUrl',
            },
            { title: 'Sign after school program anaphylaxis plan', value: 'signAnaphylaxisPlan' },
            {
                title: 'Group legacy events by contact email',
                description: 'Creates a json file that groups all legacy events',
                value: 'legacyEventsGrouping',
            },
            {
                title: 'Delete legacy events from calendar',
                value: 'deleteLegacyCalendarEvents',
            },
            {
                title: 'Migrate legacy events to new events',
                value: 'migrateLegacyEvents',
            },
            {
                title: 'Migrate science enrolments',
                description: 'Moves scienceAppointments to afterSchoolEnrolments',
                value: 'migrateScienceEnrolments',
            },
            {
                title: 'Add child support to all existing after school enrolments',
                value: 'addChildSupportToExistingEnrolments',
            },
            {
                title: 'Add food package to all parties',
                value: 'addFoodPackageToParties',
            },
            {
                title: 'Get self catered parties by notes',
                value: 'getSelfCateredPartiesByNotes',
            },
        ],
    })

    if (script === 'generatePartyFormUrl') {
        const { bookingId } = await prompts({
            type: 'text',
            name: 'bookingId',
            message: 'Please enter the booking id:',
        })
        await generatePartyFormUrl(bookingId)
    }
    if (script === 'legacyEventsGrouping') {
        await groupEventsByContactEmail()
    }
    if (script === 'deleteLegacyCalendarEvents') {
        await deleteFromLegacy()
    }
    if (script === 'migrateLegacyEvents') {
        await migrateLegacyEvents()
    }
    if (script === 'migrateScienceEnrolments') {
        await migrateScienceEnrolments()
    }
    if (script === 'addChildSupportToExistingEnrolments') {
        await migration_addChildSupportToAllExistingEnrolments()
    }
    if (script === 'signAnaphylaxisPlan') {
        const { enrolmentId } = await prompts({
            type: 'text',
            name: 'enrolmentId',
            message: 'Please enter the enrolment id:',
        })
        await getAfterSchoolProgramAnaphylaxisPlanSignedUrl(enrolmentId)
    }
    if (script === 'listAllUsers') {
        await getAllUsers()
    }

    if (script === 'deleteEventsByEmail') {
        const { email } = await prompts({
            type: 'text',
            name: 'email',
            message: 'Enter the email to delete by:',
        })
        await deleteEvents(email)
    }
    if (script === 'addFoodPackageToParties') {
        await addFoodPackageToAllParties()
    }
    if (script === 'getSelfCateredPartiesByNotes') {
        await getSelfCateredPartiesByNotes()
    }
    if (script === 'getParties') {
        const { startDate, endDate, location, type } = await prompts([
            { type: 'date', name: 'startDate', message: 'Enter a start date', initial: new Date() },
            {
                type: 'date',
                name: 'endDate',
                message: 'Enter an end date',
                initial: (prev) => DateTime.fromJSDate(prev).plus({ years: 10 }).toJSDate(),
            },
            {
                type: 'select',
                name: 'filterByLocation',
                message: 'Get all bookings, or filter by location?',
                choices: [
                    {
                        title: 'All bookings',
                        value: 'all',
                    },
                    {
                        title: 'Certain location',
                        value: 'certainLocation',
                    },
                ],
            },
            {
                type: (prev) => (prev === 'certainLocation' ? 'select' : null),
                name: 'location',
                message: 'Select the location',
                choices: STUDIOS.map((it) => ({
                    value: it,
                    title: it,
                })),
            },
            {
                type: 'select',
                name: 'filterByType',
                message: 'Get all bookings, or filter by type?',
                choices: [
                    {
                        title: 'All bookings',
                        value: 'all',
                    },
                    {
                        title: 'Certain type',
                        value: 'certainType',
                    },
                ],
            },
            {
                type: (prev) => (prev === 'certainType' ? 'select' : null),
                name: 'type',
                message: 'Select the type',
                choices: [
                    {
                        value: 'studio',
                        title: 'In studio',
                    },
                    {
                        value: 'mobile',
                        title: 'Mobile',
                    },
                ],
            },
        ])
        getParties({
            from: new Date(startDate),
            to: new Date(endDate),
            ...(location && { location }),
            ...(type && { type }),
        })
    }
    if (script === 'updatePartiesToOldPrices') {
        await updatePartiesToOldPrices()
    }
    if (script === 'runBookingsReport') {
        const { startDate, endDate, studio } = await prompts([
            { type: 'date', name: 'startDate', message: 'Enter a start date', initial: new Date() },
            {
                type: 'date',
                name: 'endDate',
                message: 'Enter an end date',
                initial: (prev) => DateTime.fromJSDate(prev).plus({ years: 10 }).toJSDate(),
            },
            {
                type: 'select',
                name: 'studio',
                message: 'Select the studio',
                choices: STUDIOS.map((it) => ({
                    value: it,
                    title: it,
                })),
            },
        ])

        const parties = await getParties({ from: startDate, to: endDate, studio })
        const events = await getEvents({ from: startDate, to: endDate, studio })
        const holidayPrograms = await getHolidayPrograms({ from: startDate, to: endDate, studio })
        const playLab = await getPlayLabPrograms({ from: startDate, to: endDate, studio })

        console.table({
            Parties: parties.length,
            Events: events.length,
            'Holiday bookings': holidayPrograms.length,
            'Play Lab bookings': playLab.length,
        })
    }
    if (script === 'updateSlingWages') {
        updateSlingWages()
    }
})()
