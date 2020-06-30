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
function createBooking(data) {
  console.log(data)
  var booking = JSON.parse(data)
  var eventId = createEvent(booking)
  if (booking.sendConfirmationEmail) {
    sendConfirmationEmail(booking)
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
function updateBooking(data) {
  console.log(data)
  data = JSON.parse(data)
  const booking = data.booking
  updateEvent(booking)
  return
}

/**
 * Deletes a booking
 *
 * To be called by firebase cloud function
 *
 * @param {object} data the booking object
 */
function deleteBooking(booking) {
  deleteEvent(booking.eventId, booking.location)
}

function sendOutForms(bookings) {
  console.log(bookings)
  for(var i = 0; i < bookings.length; i++) {
    bookings[i].dateTime = new Date(bookings[i].dateTime)
    sendOutForm(bookings[i])
  }
}