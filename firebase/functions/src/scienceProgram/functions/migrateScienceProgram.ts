import * as functions from 'firebase-functions'
import path from 'path'
import scheduleScienceProgram from '../core/scheduleScienceProgram'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const OldAppointmentTypesMap = {
    'Ripponlea Primary Science Club - Term 4, 2022': { appointmentTypeId: 37212413, calendarId: 6947379 },
}

function isValidParam(k: string): k is keyof typeof OldAppointmentTypesMap {
    return k in OldAppointmentTypesMap
}

export const migrateScienceProgram = functions.region('australia-southeast1').https.onRequest(async (req, resp) => {
    const buffer = fs.readFileSync(path.join(__dirname, '..', 'data/schedule2022-09-21.csv'))
    const data = parse(buffer)

    for (const row of data) {
        const [
            // @ts-ignore
            _start,
            // @ts-ignore
            _end,
            firstName,
            lastName,
            phone,
            email,
            type,
            // @ts-ignore
            _calendar,
            // @ts-ignore
            _price,
            // @ts-ignore
            _paid,
            // @ts-ignore
            _amountPaid,
            // @ts-ignore
            _cert,
            // @ts-ignore
            _notes,
            // @ts-ignore
            _dateScheduled,
            // @ts-ignore
            _label,
            // @ts-ignore
            _scheduledBy,
            childName,
            childAge,
            childGrade,
            // @ts-ignore
            _childHasAllergies,
            childAllergies,
            permissionToPhotograph,
            emergencyContactName,
            // @ts-ignore
            _emergencyContactRelation,
            emergencyContactPhone,
            pickupPerson1,
            pickuperPerson2,
            pickuperPerson3,
            // @ts-ignore
            _appointmentId,
        ] = row

        if (isValidParam(type)) {
            console.log(row)
            const childNames = childName.split(' ')

            await scheduleScienceProgram(
                {
                    parentFirstName: firstName,
                    parentLastName: lastName,
                    parentEmail: email,
                    parentPhone: phone.startsWith("'+") ? phone.substring(2) : phone,
                    appointmentTypeId: OldAppointmentTypesMap[type]['appointmentTypeId'],
                    calendarId: OldAppointmentTypesMap[type]['calendarId'],
                    childFirstName: childNames[0],
                    childLastName: childNames.length > 0 ? childNames[1] : '',
                    childAge: childAge,
                    childGrade: childGrade,
                    childAllergies: childAllergies,
                    childIsAnaphylactic: false,
                    emergencyContactName: emergencyContactName,
                    emergencyContactNumber: emergencyContactPhone,
                    anaphylaxisPlan: '',
                    permissionToPhotograph: permissionToPhotograph === 'Yes - I give permission',
                    className: type,
                    pickupPeople: [pickupPerson1, pickuperPerson2, pickuperPerson3].filter((it) => it !== ''),
                },
                false
            )
        }
    }
    resp.sendStatus(200)
})
