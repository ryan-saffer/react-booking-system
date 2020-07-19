/**
 * Creates a calendar event
 * 
 * @param {object} booking the booking object
 */
function createEvent(booking) {

  var eventName = `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`
  
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength)
  
  // determine which calendar to use
  var calendarId = getCalendarId(booking.location)

  var newEvent = CalendarApp.getCalendarById(calendarId).createEvent(eventName, startDate, endDate)
  newEvent.setLocation(booking.address)
  console.log("New event ID: " + newEvent.getId())
  return newEvent.getId()
}

/**
 * Updates the calendar event
 *
 * @param {object} booking the booking object
 */
function updateEvent(booking) {
  
  var eventName = `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`
  
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength)
  
  // determine which calendar to use
  var calendarId = getCalendarId(booking.location)
                                    
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
function deleteEvent(eventId, location) {
  
  var calendarId = getCalendarId(location)
  var event = CalendarApp.getCalendarById(calendarId).getEventById(eventId)
  event.deleteEvent()
}