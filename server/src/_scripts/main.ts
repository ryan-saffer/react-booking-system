import prompts from 'prompts'

import {
    migrateScienceEnrolments,
    migration_addChildSupportToAllExistingEnrolments,
} from './migrations/after-school-program'
import { deleteFromLegacy, groupEventsByContactEmail, migrateLegacyEvents } from './migrations/events'
import { generatePartyFormUrl } from './parties/generate-form'

;(async () => {
    const { script } = await prompts({
        type: 'select',
        name: 'script',
        message: 'Select script to run',
        choices: [
            {
                title: 'Generate party form URL',
                value: 'generatePartyFormUrl',
            },
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
})()
