/**
* Send booking confirmation email to parent
* Email is sent as html document, with personalised details injected as variables
*
* @param {object} booking the booking object
*/
function sendConfirmationEmail(booking) {
  
  // Determine the start and end times of the party
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength)
  
  // Determine if making one or two creations
  var creationCount;
  if (booking.location != "mobile") {
    switch (booking.partyLength) {
      case "1.5":
        creationCount = "two";
        break;
      case "2":
        creationCount = "three";
        break;
      default:
        break;
    }
  } else if (booking.location == "mobile") {
    switch (booking.partyLength) {
      case "1":
        creationCount = "two";
        break;
      case "1.5":
        creationCount = "three";
        break;
      default:
        break;
    }
  }
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('booking_confirmation_email_template');
  t.parentName = booking.parentFirstName;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.startDate = buildFormattedStartDate(startDate)
  t.startTime = Utilities.formatDate(startDate, 'Australia/Sydney', 'hh:mm a');
  t.endTime = Utilities.formatDate(endDate, 'Australia/Sydney', 'hh:mm a');
  var address = booking.address;
  if (booking.location !== "mobile") {
    address = (booking.location == "malvern") ? "our Malvern store" : "our Balwyn store"
  }
  t.address = address;
  t.location = booking.location;
  t.creationCount = creationCount;
  
  var body = t.evaluate().getContent();
  var subject = "Party Booking Confirmation";
  
  // determine which account to send from
  var fromAddress = determineFromEmailAddress(booking.location);
  
  var signature = getGmailSignature();
  
  // Send the confirmation email
  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body + signature,
      name: "Fizz Kidz"
    }
  );
}

/**
 * Sends out a pre-filled party form to the parent
 *
 * @param {object} booking the booking object
 */
function sendOutForm(booking) {
  
  // Determine the start and end times of the party
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength);
  
  // create a pre-filled form URL
  var preFilledURL = getPreFilledFormURL(booking);
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('party_form_email_template');
  t.parentName = booking.parentFirstName;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.startDate = buildFormattedStartDate(startDate)
  t.startTime = Utilities.formatDate(startDate, 'Australia/Sydney', 'hh:mm a');
  t.endTime = Utilities.formatDate(endDate, 'Australia/Sydney', 'hh:mm a');
  
  // determine location
  var address = booking.address;
  if (booking.location !== "mobile") {
    address = (booking.location == "malvern") ? "our Malvern store" : "our Balwyn store";
  }
  t.address = address;
  t.preFilledURL = preFilledURL;
  
  var body = t.evaluate().getContent();
  var subject = "Information regarding your upcoming party!";

  // determine the from email address
  var fromAddress = determineFromEmailAddress(booking.location);

  var signature = getGmailSignature();
  
  // Send the confirmation email
  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body + signature,
      name: "Fizz Kidz"
    }
  );
}

/**
 * Creates a pre-filled URL for the party form
 *
 * @param {object} booking the booking object
 * @return {string} URL the url of the pre-filled form
 */
function getPreFilledFormURL(booking) {

  // form IDs
  var inStoreFormId = "1gL6_H4xgpOz_J616DN4HvKMWHfkf6Bdvrbl4-fJtiV0";
  var mobileFormId = "17NNqsqsq3EBLGsMOl93neeWXXkcbF4SiJIj-gXDiknM";
  
  // open the correct form, create a response and get the items
  var formID = (booking.location !== "mobile") ? inStoreFormId : mobileFormId;
  var form = FormApp.openById(formID);
  var formResponse = form.createResponse();
  var formItems = form.getItems();
  
  // first question - date and time
  var dateItem = formItems[1].asDateTimeItem();
  
  // due to strange time formatting behaviour, update the time to (time + 10) or (time + 11) depending on daylight savings
  var correctedPartyTime = 0;
  switch (booking.dateTime.getTimezoneOffset()) {
    case -600: // GMT + 10
      correctedPartyTime = booking.dateTime.getHours() + 10;
      break;
    case -660: // GMT + 11
      correctedPartyTime = booking.dateTime.getHours() + 11;
      break;
    default:
        break;
  }
  booking.dateTime = new Date(
    booking.dateTime.getFullYear(),
    booking.dateTime.getMonth(),
    booking.dateTime.getDate(),
    correctedPartyTime,
    booking.dateTime.getMinutes()
  );
  var response = dateItem.createResponse(booking.dateTime);
  formResponse.withItemResponse(response);
  
  // second question - parents name
  var parentNameItem = formItems[2].asTextItem();
  response = parentNameItem.createResponse(booking.parentFirstName);
  formResponse.withItemResponse(response);
  
  // third question - childs name
  var childNameItem = formItems[3].asTextItem();
  response = childNameItem.createResponse(booking.childName);
  formResponse.withItemResponse(response);
  
  // fourth question - childs age
  var childAgeItem = formItems[4].asTextItem();
  response = childAgeItem.createResponse(booking.childAge);
  formResponse.withItemResponse(response);

  // fifth question - location - only if in-store
  if (booking.location !== "mobile") {
    var locationItem = formItems[5].asListItem();
    response = locationItem.createResponse(capitalise(booking.location));
    formResponse.withItemResponse(response);
  }
    
  return formResponse.toPrefilledUrl();
}