/**
 * Creates a calendar event
 * 
 * @param {string} id the id of the booking in firestore
 * @param {object} booking the booking object
 * @param {string} environment either prod or dev
 */
function createEvent(id, booking, environment) {

  const eventName = `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`
  
  const startDate = new Date(booking.dateTime)
  const endDate = getEndDate(startDate, booking.partyLength)
  
  // determine which calendar to use
  const calendarId = getCalendarId(booking.location, environment)
  
  const domain = getApplictionDomain(environment)
  const options = {
    description: `${domain}/bookings?id=${id}`
  }
  const newEvent = CalendarApp.getCalendarById(calendarId).createEvent(eventName, startDate, endDate, options)
  newEvent.setLocation(booking.address)
  console.log("New event ID: " + newEvent.getId())
  return newEvent.getId()
}

/**
 * Updates the calendar event
 *
 * @param {object} booking the booking object
 */
function updateEvent(booking, environment) {
  
  var eventName = `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`
  
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength)
  
  // determine which calendar to use
  var calendarId = getCalendarId(booking.location, environment)
                                    
  var event = CalendarApp.getCalendarById(calendarId).getEventById(booking.eventId)
  event.setTitle(eventName)
  event.setTime(startDate, endDate)
  event.setLocation(booking.address)

  return
}

/**
 * Deletes an event from google calendar
 *
 * @param {string} eventId the id of the event to delete
 * @param {string} location the location of the booking
 */
function deleteEvent(eventId, location, environment) {
  
  var calendarId = getCalendarId(location, environment)
  var event = CalendarApp.getCalendarById(calendarId).getEventById(eventId)
  event.deleteEvent()
}