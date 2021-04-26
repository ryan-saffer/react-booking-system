import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
import { isAcuityError } from './shared'
import { runAppsScript } from '../bookings'
import { Acuity, AppsScript } from 'fizz-kidz'

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

const firestore = admin.firestore()

const SCIENCE_CLUB_TAG = "Science Club"

type MinifiedAppointmentsMap = { [key: string]: AppsScriptAppointment[] }

type AppsScriptAppointment = {
    parentFirstName: string,
    parentLastName: string,
    parentPhone: string,
    parentEmail: string,
    childName: string,
    childGrade: string,
    label: string,
    notes: string,
    checkoutPerson: string,
    checkoutTime: string
}

exports.backupScienceClubAppointments = functions
  .region('australia-southeast1')
  .pubsub.schedule('30 17 * * 1-5')
  .timeZone('Australia/Victoria')
  .onRun( _context => {

    acuity.request('appointment-types', (err: any, _resp: any, acuityResponse: Acuity.AppointmentType[] | Acuity.Error) => {
        const appointmentTypes = handleAcuityResult(err, acuityResponse)

        const scienceClubAppointmentTypes = appointmentTypes.filter(it => it.category === SCIENCE_CLUB_TAG)

        // get all appointments for each type that occured yesterday
        const yesterday = new Date()
        yesterday.setHours(0)
        yesterday.setMinutes(0)
        yesterday.setSeconds(0)
        const today = new Date(yesterday)
        today.setDate(yesterday.getDate() + 1)

        const promises: Promise<MinifiedAppointmentsMap>[] = []
        scienceClubAppointmentTypes.forEach(appointmentType => {
            promises.push(fetchAppointments(yesterday, today, appointmentType))
        })

        return Promise.all(promises)
            .then(result => {
                // merge array of objects into one object
                const masterMap: MinifiedAppointmentsMap = Object.assign({}, ...result)

                for (const [key, value] of Object.entries(masterMap)) {
                    if (value.length === 0) {
                        delete masterMap[key]
                    }
                }

                runAppsScript(AppsScript.Functions.BACKUP_SCIENCE_CLUB, [masterMap])
                    .then(() => { return masterMap })
                    .catch(error => { throw new functions.https.HttpsError('internal', `error running apps script ${AppsScript.Functions.BACKUP_SCIENCE_CLUB}`, error) })
                
            })
            .catch(error => {
                console.log(error)
                throw new functions.https.HttpsError('internal', 'error fetching acuity appointment', error)
            })

  })
})

function fetchAppointments(
    startDate: Date,
    endDate: Date,
    appointmentType: Acuity.AppointmentType
) {
    return new Promise<MinifiedAppointmentsMap>((resolve, reject) => {
        acuity.request(
            `/appointments?appointmentTypeID=${appointmentType.id}&minDate=${startDate.toISOString()}&maxDate=${endDate.toISOString()}`,
            (err: any, _acuityRes: any, appointments: Acuity.Appointment[] | Acuity.Error) => {

                if (err) { reject(err) }
                else if (isAcuityError(appointments)) { reject(appointments) }
                else { 

                    // the person who check out the child is only recoreded in firestore
                    // so first get all appointments that were checked out and find the value
                    // then merge in back into the appointment
                    const checkedOutAppointments: Acuity.MergedAppointment[] = []
                    const restOfAppointments: Acuity.Appointment[] = []
                    appointments.forEach(appointment => {
                        if (appointment.labels && appointment.labels[0].id === Acuity.Constants.Labels.CHECKED_OUT) {
                            checkedOutAppointments.push(appointment as Acuity.MergedAppointment)
                        } else {
                            restOfAppointments.push(appointment)
                        }
                    })

                    const promises: Promise<Acuity.MergedAppointment>[] = []
                    checkedOutAppointments.forEach(appointment => {
                        promises.push(mergeCheckoutData(appointment))
                    })

                    Promise.all(promises)
                        .then(MergedApppointments => {
                            const masterMap = [...MergedApppointments, ...restOfAppointments]
                            const cleanedResults = masterMap.map<AppsScriptAppointment>(appointment => {
                                return {
                                    parentFirstName: appointment.firstName,
                                    parentLastName: appointment.lastName,
                                    parentPhone: appointment.phone,
                                    parentEmail: appointment.email,
                                    childName: Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME),
                                    childGrade: Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_GRADE),
                                    label: appointment.labels && appointment.labels[0].name,
                                    notes: appointment.notes,
                                    checkoutPerson: (appointment as Acuity.MergedAppointment).checkoutPerson,
                                    checkoutTime: (appointment as Acuity.MergedAppointment).checkoutTime
                                }
                            })
                            resolve({ [appointmentType.name]: cleanedResults })
                        })
                        .catch(error => reject(error))
                    }
            }
        )
    })
}

async function mergeCheckoutData(appointment: Acuity.MergedAppointment) {
    const doc = await firestore.collection('scienceClubAppointments').doc(appointment.id.toString()).get()
    if (doc.exists) {
        appointment.checkoutPerson = doc.data()?.pickupPerson
        appointment.checkoutTime = doc.data()?.timeStamp.toDate()
        return appointment
    }
    return appointment
}



function handleAcuityResult<T>(error: any, result: T | Acuity.Error) {
    if (isAcuityError(result)) {
        console.error('error fetching appointment types:', result.message)
        throw new Error(result.error)
    }
    if (error) {
        throw new Error(error)
    }
    return result
}