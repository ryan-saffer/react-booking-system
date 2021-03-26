import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
import * as Acuity from '../../types/acuity'
import { isAcuityError } from './shared'
import { runAppsScript } from '../bookings'
import * as AcuityConstants from '../constants/acuity'

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
    label: string,
    notes: string,
    checkoutPerson: string,
    checkoutTime: string
}

// exports.sendFeedbackEmails = functions
//   .region('australia-southeast1')
//   .pubsub.schedule('30 8 * * *')
//   .timeZone('Australia/Victoria')
//   .onRun( _ 
    
export const backupScienceClubAppointments = functions
    .region('australia-southeast1')
    .https.onRequest((req, resp) => {

    acuity.request('appointment-types', (err: any, _resp: any, acuityResponse: Acuity.AppointmentType[] | Acuity.Error) => {
        let appointmentTypes = handleAcuityResult(err, acuityResponse)

        let scienceClubAppointmentTypes = appointmentTypes.filter(it => it.category === SCIENCE_CLUB_TAG)

        // get all appointments for each type that occured yesterday
        let yesterday = new Date()
        yesterday.setHours(0)
        yesterday.setMinutes(0)
        yesterday.setSeconds(0)
        // REMOVE BELOW SINGLE LINE
        yesterday.setDate(yesterday.getDate() - 1)
        let today = new Date(yesterday)
        today.setDate(yesterday.getDate() + 1)

        const promises: Promise<MinifiedAppointmentsMap>[] = []
        scienceClubAppointmentTypes.forEach(appointmentType => {
            promises.push(fetchAppointments(yesterday, today, appointmentType))
        })

        Promise.all(promises)
            .then(result => {
                // merge array of objects into one object
                let masterMap: MinifiedAppointmentsMap = Object.assign({}, ...result)

                for (const [key, value] of Object.entries(masterMap)) {
                    if (value.length === 0) {
                        delete masterMap[key]
                    }
                }

                runAppsScript('testBackupScienceClub', [masterMap])
                .then(_ => resp.status(200).send(masterMap))
                .catch(_ => resp.status(500).send())
                
            })
            .catch(error => {
                console.log(error)
                resp.status(500).send()
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
            `/appointments?appointmentTypeID=${appointmentType.id}&minDate=${startDate.toISOString()}&maxDate=${endDate.toISOString()}&excludeForms=true`,
            (err: any, _acuityRes: any, appointments: Acuity.Appointment[] | Acuity.Error) => {

                if (err) { reject(err) }
                else if (isAcuityError(appointments)) { reject(appointments) }
                else { 

                    // the person who check out the child is only recoreded in firestore
                    // so first get all appointments that were checked out and find the value
                    // then merge in back into the appointment
                    var checkedOutAppointments: Acuity.Appointment[] = []
                    var restOfAppointments: Acuity.Appointment[] = []
                    appointments.forEach(appointment => {
                        if (appointment.labels && appointment.labels[0].id === AcuityConstants.LABELS.CHECKED_OUT) {
                            checkedOutAppointments.push(appointment)
                        } else {
                            restOfAppointments.push(appointment)
                        }
                    })

                    const promises: Promise<Acuity.Appointment>[] = []
                    checkedOutAppointments.forEach(appointment => {
                        promises.push(mergeCheckoutData(appointment))
                    })

                    Promise.all(promises)
                        .then(mergedAppointments => {
                            const masterMap = [...mergedAppointments, ...restOfAppointments]
                            const cleanedResults = masterMap.map<AppsScriptAppointment>(appointment => {
                                return {
                                    parentFirstName: appointment.firstName,
                                    parentLastName: appointment.lastName,
                                    parentPhone: appointment.phone,
                                    parentEmail: appointment.email,
                                    label: appointment.labels && appointment.labels[0].name,
                                    notes: appointment.notes,
                                    checkoutPerson: appointment.checkoutPerson,
                                    checkoutTime: appointment.checkoutTime
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

async function mergeCheckoutData(appointment: Acuity.Appointment) {
    const doc = await firestore.collection('scienceClubAppointments').doc(appointment.id.toString()).get()
    if (doc.exists) {
        appointment.checkoutPerson = doc.data()?.pickupPerson
        appointment.checkoutTime = doc.data()?.timeStamp
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