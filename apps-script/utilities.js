/**
 * Returns the email address that the email should be sent from based on party location
 * If Malvern, send from "malvern@fizzkidz.com.au"
 * If Balwyn or Mobile, send from "info@fizzkidz.com.au"
 * 
 * @param {String} location the location of the store
 * @returns {String} email address to send from
 */
function determineFromEmailAddress(location) {

  if(location == "malvern") {
    // send from malvern@fizzkidz.com.au
    return "malvern@fizzkidz.com.au";
  }
  else { // balwyn or mobile
    // send from info@fizzkidz.com.au
    return "info@fizzkidz.com.au";
  }
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