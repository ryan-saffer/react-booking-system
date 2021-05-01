/**
 * Returns the email address that the email should be sent from based on party location
 * If Malvern, send from "malvern@fizzkidz.com.au"
 * If Balwyn, Essendon or Mobile, send from "info@fizzkidz.com.au"
 * 
 * @param {String} location the location of the store
 * @returns {String} email address to send from
 */
function determineFromEmailAddress(location) {
  return 'bookings@fizzkidz.com.au';
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
function getCalendarId(location, environment) {

  // event IDs
  var balwynStorePartiesCalendarID;
  var essendonStorePartiesClaendarID;
  var malvernStorePartiesCalendarID;
  var mobilePartiesCalendarID;
  
  if (environment === "prod") {
    balwynStorePartiesCalendarID = "fizzkidz.com.au_7vor3m1efd3fqbr0ola2jvglf8@group.calendar.google.com"
    essendonStorePartiesClaendarID = "fizzkidz.com.au_k1ubc2bi0ufvhoer4o9pakion0@group.calendar.google.com"
    malvernStorePartiesCalendarID = "fizzkidz.com.au_j13ot3jarb1p9k70c302249j4g@group.calendar.google.com"
    mobilePartiesCalendarID = "fizzkidz.com.au_b9aruprq8740cdamu63frgm0ck@group.calendar.google.com"
  } else {
    balwynStorePartiesCalendarID = "fizzkidz.com.au_ofsgsp4oijbjpvm40o1bihk7bg@group.calendar.google.com"
    essendonStorePartiesClaendarID = "c_3aae8htcpjgpmnrod7ujrqsccc@group.calendar.google.com"
    malvernStorePartiesCalendarID = "fizzkidz.com.au_knove8gbjklh2cm5di6qfs0bs0@group.calendar.google.com"
    mobilePartiesCalendarID = "fizzkidz.com.au_k5gsanlpnslk9i4occfd4elt00@group.calendar.google.com"
  }

  switch (location) {
    case "balwyn":
      return balwynStorePartiesCalendarID
    case "essendon":
      return essendonStorePartiesClaendarID
    case "malvern":
      return malvernStorePartiesCalendarID
    case "mobile":
      return mobilePartiesCalendarID
  }
}

/**
 * Given a booking, returns the address of the booking.
 * If not mobile, return the store address, otherwise the address from the booking.
 * 
 * @param {object} booking 
 * @returns {string} the address of the party
 */
function getPartyAddress(booking) {
  if (booking.location === 'mobile') {
    return booking.address
  } else {
    switch(booking.location) {
      case 'balwyn':
        return "184 Whitehorse Rd, Balwyn, 3103"
      case 'essendon':
        return "75 Raleigh St, Essendon, 3040"
      case 'malvern':
        return "20 Glenferrie Rd, Malvern, 3144"
    }
  }
}

/**
 * Given an mjml template filename, calls the mjml api and returns an HtmlTemplate of the converted html.
 * 
 * @param {string} filename the name of the mjml template file
 * @returns an HtmlTemplate (https://developers.google.com/apps-script/reference/html/html-template) or null if there is an error
 */
function getHtmlTemplateForFile(filename) {

  // use mjml API to transform mjml template tp html
  var rawHtml = HtmlService.createTemplateFromFile(filename).getRawContent()

  const payload = {
    mjml: rawHtml
  }

  const options = {
    headers: {
      Authorization: 'Basic ZWI1MDNlODYtNzJhMy00MjdkLTlkYmUtYjU4NWQzMzFhN2Y0OmEwYjMzZjVkLTE3NTktNDM5Ni04NDE2LTQyNDI2NTEzMmI4ZA=='
    },
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  }
  var response = UrlFetchApp.fetch(`https://api.mjml.io/v1/render`, options)
  var content = response.getContentText()
  if (response.getResponseCode() !== 200) {
    console.error(`error using mjml API: ${JSON.parse(content).message}`)
    return null
  }
  
  return HtmlService.createTemplate(JSON.parse(content).html);
}

/**
 * Returns the domain of the application depending on the environment
 * 
 * @param {string} environment prod or dev
 */
function getApplictionDomain(environment) {
  return environment === "prod" ? "https://bookings.fizzkidz.com.au" : "https://booking-system-6435d.web.app"
}