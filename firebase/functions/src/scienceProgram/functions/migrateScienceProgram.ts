// import * as functions from 'firebase-functions'
// import path from 'path'
// import scheduleScienceProgram from '../core/scheduleScienceProgram'
// import fs from 'fs'
// import { parse } from 'csv-parse/sync'

// const OldAppointmentTypesMap = {
//     'Ripponlea Primary Science Club - Term 4, 2022': { appointmentTypeId: 37212413, calendarId: 6947379 },
//     'Abbotsford Primary Science Club - Term 4, 2022': { appointmentTypeId: 37673757, calendarId: 6947379 },
// }

// function isValidParam(k: string): k is keyof typeof OldAppointmentTypesMap {
//     return k in OldAppointmentTypesMap
// }

// export const migrateScienceProgram = functions.region('australia-southeast1').https.onRequest(async (req, resp) => {
//     const buffer = fs.readFileSync(path.join(__dirname, '..', 'data/schedule2022-10-07-abbotsford.csv'))
//     const data = parse(buffer)

//     for (const row of data) {
//         const [
//             // @ts-ignore
//             _start,
//             // @ts-ignore
//             _end,
//             firstName,
//             lastName,
//             phone,
//             email,
//             type,
//             // @ts-ignore
//             _calendar,
//             // @ts-ignore
//             _price,
//             // @ts-ignore
//             _paid,
//             // @ts-ignore
//             _amountPaid,
//             // @ts-ignore
//             _cert,
//             // @ts-ignore
//             _notes,
//             // @ts-ignore
//             _dateScheduled,
//             // @ts-ignore
//             _label,
//             // @ts-ignore
//             _scheduledBy,
//             childName,
//             childAge,
//             childGrade,
//             // @ts-ignore
//             _childHasAllergies,
//             childAllergies,
//             permissionToPhotograph,
//             emergencyContactName,
//             emergencyContactRelation,
//             emergencyContactPhone,
//             pickupPerson1,
//             pickuperPerson2,
//             pickuperPerson3,
//             // @ts-ignore
//             _appointmentId,
//         ] = row

//         if (isValidParam(type)) {
//             console.log(row)
//             const childNames = childName.split(' ')

//             await scheduleScienceProgram(
//                 {
//                     parent: {
//                         firstName: firstName,
//                         lastName: lastName,
//                         email: email,
//                         phone: phone.startsWith("'+") ? phone.substring(2) : phone,
//                     },
//                     appointmentTypeId: OldAppointmentTypesMap[type]['appointmentTypeId'],
//                     calendarId: OldAppointmentTypesMap[type]['calendarId'],
//                     child: {
//                         firstName: childNames[0],
//                         lastName: childNames.length > 0 ? childNames[1] || '' : '',
//                         age: childAge,
//                         grade: childGrade,
//                         allergies: childAllergies,
//                         isAnaphylactic: false,
//                         anaphylaxisPlan: '',
//                         permissionToPhotograph: permissionToPhotograph === 'Yes - I give permission',
//                     },
//                     emergencyContact: {
//                         name: emergencyContactName,
//                         relation: emergencyContactRelation,
//                         phone: emergencyContactPhone,
//                     },
//                     className: type,
//                     pickupPeople: [pickupPerson1, pickuperPerson2, pickuperPerson3].filter((it) => it !== ''),
//                 },
//                 false,
//                 false
//             )
//         }
//     }
//     resp.sendStatus(200)
// })
