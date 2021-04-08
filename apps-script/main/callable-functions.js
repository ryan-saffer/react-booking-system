/**
 * All functions in this file are intended to be called externally.
 * They act as a gateway to call the methods in the other files.
 *
 * Currently firebase functions are calling these functions.
 */

/**
 * Creates a new booking by:
 * 1. Creating calendar event
 * 2. Sending confirmation email
 *
 * To be called by firebase cloud function
 *
 * @param {object} booking the booking object
 * @return {string} the event id
 *
 */
function createBooking(id, booking, environment) {
  console.log(booking)
  console.log(environment)
  booking = JSON.parse(booking)
  var eventId = createEvent(id, booking, environment)
  if (booking.sendConfirmationEmail) {
    sendBookingConfirmationEmail(booking)
  }
  return eventId
}

/**
 * Updates a bookings calendar event, and re-generates the party sheet if required
 * 
 * To be called by firebase cloud function
 *
 * @param {object} data the an object containing bookingId and the booking itself
 */
function updateBooking(data, environment) {
  console.log(data)
  console.log(environment)
  data = JSON.parse(data)
  const booking = data.booking
  updateEvent(booking, environment)
  return
}

/**
 * Deletes a booking
 *
 * To be called by firebase cloud function
 *
 * @param {object} data the booking object
 */
function deleteBooking(booking, environment) {
  console.log(booking)
  console.log(environment)
  deleteEvent(booking.eventId, booking.location, environment)
}

/**
 * Sends all provided bookings their 'Information about your party' email
 * Email includes a pre-filled Google Forms URL where they select creations etc.
 * 
 * @param {Array} bookings array of bookings to send a form to
 */
function sendOutForms(bookings) {
  console.log(bookings)
  for(var i = 0; i < bookings.length; i++) {
    bookings[i].dateTime = new Date(bookings[i].dateTime)
    sendOutForm(bookings[i])
  }
}

/**
 * Called when a form is submitted, and a matching booking is succesfully found.
 * Sends confirmation email to parent, along with cake/question notifications to info@fizzkidz.com.au 
 *
 * @param {object} booking the firestore booking object, with dateTime as a JSDate
 * @param {[string]} additions array of all selected additions
 */
function onFormSubmitBookingFound(booking, creations, additions) {
  console.log("booking:")
  console.log(booking)
  console.log("creations")
  console.log(creations)
  console.log('additions')
  console.log(additions)

  // cake notification
  if (booking.cake) {
    console.log("sending cake notification")
    sendCakeNotification(booking)
  }

  // questions notification
  if (booking.questions) {
    console.log("sending questions notification")
    sendQuestionsNotification(booking)
  }

  console.log("sending confirmation email")
  sendOnFormSubmitConfirmationEmail(booking, creations, additions)
}

/**
 * Called when a form is submitted, and a matching booking could not be found.
 * Sends a notification email to info@fizzkidz.com.au with details. 
 *
 * @param {[string]} formValues the values from the form that the parent filled in
 */
function onFormSubmitBookingNotFound(formValues) {
  console.log('form values:')
  console.log(formValues)
  const location = formValues.length === 19 ? formValues[5] : 'Mobile'
  sendBookingNotFoundEmail(formValues[1], formValues[2], formValues[3], formValues[4], location)
}

/**
 * Send all provided bookings their 'We hope your enjoyed your party!' email
 * Email links to the review page for their locations listing
 * 
 * @param {Array} bookings array of bookings to send the feedback email to
 */
function sendFeedbackEmails(bookings) {
  console.log(bookings)
  for(var i = 0; i < bookings.length; i++) {
    bookings[i].dateTime = new Date(bookings[i].dateTime)
    sendFeedbackEmail(bookings[i])
  }
}

/**
 * Copies all appointments provided into a Google Spreadsheet, for record keeping.
 * Once backed up, the appointment can be safely deleted from acuity, and allow people to book into the series.
 * 
 * @param {Object} appointmentsMap map of each science club appointment type as the key, and array of appointments as the value
 */
function backupScienceClub(appointmentsMap) {

  console.log(appointmentsMap)

  const spreadsheetId = '1t9R_P-zibGHPS4qYucUpRYMHMiY5a7EMhs5XxaeCMi8'
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)

  for (const [key, value] of Object.entries(appointmentsMap)) {
    var sheet = spreadsheet.getSheetByName(key)

    // check if class already exists (this should only occur on week 1)
    if (sheet == null) {
      sheet = spreadsheet.insertSheet(key)
      sheet.appendRow(['Parent First Name', 'Parent Last Name', 'Parent Phone', 'Parent Email', 'Child Name', 'Child Grade', 'Label', 'Notes', 'Checked Out By', 'Checkout Time'])
      sheet.getRange('A1:J1').setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    // merge next row into single cell for the date
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 10)
      .merge()
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')

    // append date
    const date = new Date()
    sheet.appendRow([date.toLocaleDateString()])

    // append each appointment
    value.forEach(appointment => {
      sheet.appendRow([
        appointment.parentFirstName,
        appointment.parentLastName,
        appointment.parentPhone,
        appointment.parentEmail,
        appointment.childName,
        appointment.childGrade,
        appointment.label,
        appointment.notes,
        appointment.checkoutPerson,
        appointment.checkoutTime
      ])
    })
  }
}