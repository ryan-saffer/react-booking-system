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
 * Creates a calendar event
 * 
 * @param {object} booking the booking object
 */
function createEvent(booking) {

  var eventName = booking.parentFirstName + " / " + booking.childName + " " + booking.childAge + "th " + booking.parentMobile
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
  
  var eventName = booking.parentFirstName + " / " + booking.childName + " " + booking.childAge + "th " + booking.parentMobile
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
 * Determines the parties end date/time based on starting time and length
 * 
 * @returns {Date} the date and time the party ends
 */
function getEndDate(dateTime, partyLength) {
  
    // determine when party ends
    var lengthHours = 0;
    var lengthMinutes = 0;
    switch (partyLength) {
        case "1":
            lengthHours = 1;
            break;
        case "1.5":
            lengthHours = 1;
            lengthMinutes = 30;
            break;
        case "2":
            lengthHours = 2;
            break;
        default:
            break;
    }
    
    var endDate = new Date(
        dateTime.getFullYear(),
        dateTime.getMonth(),
        dateTime.getDate(),
        dateTime.getHours() + lengthHours,
        dateTime.getMinutes() + lengthMinutes
    )
    
    return endDate
}

/**
 * Gets the Google Calendar ID for this location
 * 
 * @returns {String} the ID of the correct Calendar
 */
function getCalendarId(location) {

  // event IDs
  var balwynStorePartiesCalendarID = "fizzkidz.com.au_ofsgsp4oijbjpvm40o1bihk7bg@group.calendar.google.com"
  var malvernStorePartiesCalendarID = "fizzkidz.com.au_knove8gbjklh2cm5di6qfs0bs0@group.calendar.google.com"
  var mobilePartiesCalendarID = "fizzkidz.com.au_k5gsanlpnslk9i4occfd4elt00@group.calendar.google.com"

  switch (location) {
    case "balwyn":
      return balwynStorePartiesCalendarID
    case "malvern":
      return malvernStorePartiesCalendarID
    case "mobile":
      return mobilePartiesCalendarID
  }
}