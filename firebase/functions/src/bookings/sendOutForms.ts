import { AppsScript } from 'fizz-kidz';
import * as functions from 'firebase-functions'
import { DateTime } from 'luxon'
import { runAppsScript } from '.'
import { db } from '../index'

export const sendOutForms = functions
  .region('australia-southeast1')
  .pubsub.schedule('30 8 * * 4')
  .timeZone('Australia/Melbourne')
  .onRun((_context) => {
    
    var startDate = DateTime.fromObject({ hour: 0, minute: 0, second: 0 }, { zone: "Australia/Melbourne" }).toJSDate()
    startDate.setDate(startDate.getDate() + ((1 + 7 - startDate.getDay()) % 7)) // will always get upcoming Tuesday
    var endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    console.log("Start date:")
    console.log(startDate)
    console.log("End date:")
    console.log(endDate)

    var bookings: any[] = []

    return new Promise<void>((resolve, reject) => {
      db.collection('bookings')
      .where('dateTime', '>', startDate)
      .where('dateTime', '<', endDate)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          var booking = documentSnapshot.data()
          booking.dateTime = booking.dateTime.toDate()
          booking.id = documentSnapshot.id
          bookings.push(booking)
        })
        console.log('running apps script...')
        runAppsScript(AppsScript.Functions.SEND_OUT_FORMS, [bookings])
          .then(() => {
            console.log('finished apps script')
            resolve()
          })
          .catch(err => {
            console.log("Error running AppsScript")
            reject(err)
          })
      })
      .catch(err => {
        console.log("Error fetching bookings from firestore")
        reject(err)
      })
    })
  })