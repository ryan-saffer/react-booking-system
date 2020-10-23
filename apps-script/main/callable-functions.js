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
function createBooking(data, environment) {
  console.log(data)
  console.log(environment)
  var booking = JSON.parse(data)
  var eventId = createEvent(booking, environment)
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
 * @param {object} data the booking object
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