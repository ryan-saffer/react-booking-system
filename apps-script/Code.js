function createBooking(bookingId, data) {
  
  console.log(bookingId)
  console.log(data)
  var booking = JSON.parse(data)
  console.log(booking)

  var eventId = createEvent(bookingId, booking)
  return eventId
}

/**
 * Creates a calendar event
 * 
 * @param {object} booking the booking object
 */
function createEvent(bookingId, booking) {

  var eventName = booking.parentFirstName + " / " + booking.childName + " " + booking.childAge + "th " + booking.parentMobile
  var startDate = new Date(booking.dateTime)
  
  var endDate = getEndDate(startDate, booking.partyLength)
  
  // determine which calendar to use
  var calendarId = getCalendarId(booking.location)

  var newEvent = CalendarApp.getCalendarById(calendarId).createEvent(eventName, startDate, endDate)
  console.log("New event ID: " + newEvent.getId())
  return newEvent.getId()
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