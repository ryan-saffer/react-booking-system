/**
 * Returns the email address that the email should be sent from based on party location
 * If Malvern, send from "malvern@fizzkidz.com.au"
 * If Balwyn or Mobile or Virtual, send from "info@fizzkidz.com.au"
 * 
 * @param {String} location the location of the store
 * @returns {String} email address to send from
 */
function determineFromEmailAddress(location) {

  if(location == "malvern") {
    // send from malvern@fizzkidz.com.au
    return "malvern@fizzkidz.com.au";
  }
  else { // balwyn or mobile or virtual
    // send from info@fizzkidz.com.au
    return "info@fizzkidz.com.au";
  }
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
 * Gets the correct managers signature depending on who email is being sent from
 * 
 * @returns {String} the signature
 */
function getGmailSignature() {
  
  var draft = GmailApp.search("subject:talia-signature label:draft", 0, 1);
  return draft[0].getMessages()[0].getBody();
}

/**
 * Returns the start date as a formatted string
 * 
 * @param {Date} date - the start date of the party
 * @returns {String} the date formatted as 'Friday 3rd June 2019'
 */
function buildFormattedStartDate(date) {

  var suffix = determineSuffix(date.getDate())
  var dayOfWeekAndMonth = Utilities.formatDate(date, 'Australia/Sydney', "EEEE d");
  var monthAndYear = Utilities.formatDate(date, 'Australia/Sydney',"MMMM y")
  return dayOfWeekAndMonth + suffix + ' ' + monthAndYear
}

/**
 * Returns correct suffix according to day of month ie '1st', '2nd', '3rd' or '4th'
 * 
 * @param {Int} day - the day of the month 1-31
 * @returns {String} the suffix of the day of the month
 */
function determineSuffix(day) {

  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch(day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
   }
}

/**
 * Capitalises a given word
 *
 * @param {string} string the word to capitalise
 * @return {string} the word capitalised
 */
function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
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
  var virtualPartiesCalendarID = "fizzkidz.com.au_pj653mtg8t0pth9321cjqu8hbk@group.calendar.google.com"

  switch (location) {
    case "balwyn":
      return balwynStorePartiesCalendarID
    case "malvern":
      return malvernStorePartiesCalendarID
    case "mobile":
      return mobilePartiesCalendarID
    case "virtual":
      return virtualPartiesCalendarID
  }
}