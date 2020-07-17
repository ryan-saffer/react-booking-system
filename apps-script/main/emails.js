/**
* Send booking confirmation email to parent
* Email is sent as html document, with personalised details injected as variables
*
* @param {object} booking the booking object
*/
function sendBookingConfirmationEmail(booking) {
  
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
  var inStoreFormId = "1oxkBrs8JCboSG2DwX00QMUGPC8kIG54w7Evn2zvEH9g";
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
  response = parentNameItem.createResponse(`${booking.parentFirstName} ${booking.parentLastName}`);
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

/**
 * Sends a notification email to info@fizzkidz.com.au that a form was filled in,
 * but the booking could not be found in firestore 
 *
 * @param {string} dateTime the date and time of party
 * @param {string} parentName the parents name
 * @param {string} childName the childs name
 * @param {string} childAge the childs age
 * @param {string} location location (balwyyn, essendon, malvern, mobile)
 */
function sendBookingNotFoundEmail(dateTime, parentName, childName, childAge, location) {
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('error_finding_booking_template');
  t.parentName = parentName;
  t.childName = childName;
  t.childAge = childAge;
  t.dateTime = dateTime;
  t.location = location;
  
  var body = t.evaluate().getContent();
  var subject = "ERROR: Booking not found!";
  
  // Send the confirmation email
  GmailApp.sendEmail('info@fizzkidz.com.au', subject, "", {htmlBody: body, name : "Fizz Kidz"});
}

/**
 * Sends a notification email to info@fizzkidz.com.au detailing the customers cake selection
 * @param {object} booking the booking objet
 */
function sendCakeNotification(booking) {
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('cake_ordered_email_template');
  t.parentName = `${booking.parentFirstName} ${booking.parentLastName}`;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.dateTime = Utilities.formatDate(new Date(booking.dateTime), "Australia/Melbourne", "EEEE, dd MMMM yyyy, HH:mm a")
  t.selectedCake = booking.cake;
  t.cakeFlavour = booking.cakeFlavour;
  t.location = capitalise(booking.location);
  
  var body = t.evaluate().getContent();
  var subject = "Cake Order!";
  var fromAddress = determineFromEmailAddress(booking.location);
  
  // Send the confirmation email
  GmailApp.sendEmail(fromAddress, subject, "", {from: fromAddress, htmlBody: body, name : "Fizz Kidz"});
}

/**
 * Send a notification email to info@fizzkidz.com.au that the parent asked questions in the form
 *
 * @param {object} booking the bookect object
 */
function sendQuestionsNotification(booking) {
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('questions_email_template');
  t.parentName = `${booking.parentFirstName} ${booking.parentLastName}`;
  t.childName = booking.childName;
  t.dateTime = Utilities.formatDate(new Date(booking.dateTime), "Australia/Melbourne", "EEEE, dd MMMM yyyy, HH:mm a")
  t.location = capitalise(booking.location)
  t.questions = booking.questions;
  t.emailAddress = booking.parentEmail
  
  var body = t.evaluate().getContent();
  var subject = "Questions asked in Party Form!";
  var fromAddress = determineFromEmailAddress(booking.location);
  
  // Send the confirmation email
  GmailApp.sendEmail(fromAddress, subject, "", {from: fromAddress, htmlBody: body, name : "Fizz Kidz"});
}

/**
 * Sends the customer a confirmation email detailing their selections
 * along with information about the party
 *
 * @param {object} booking the booking object
 * @param {[string]} creations the creations selected as displayed on the form
 * @param {[string]} additions the additions selected as displayed on the form
 */
function sendOnFormSubmitConfirmationEmail(booking, creations, additions) {
  
  var t = HtmlService.createTemplateFromFile('customer_form_completed_confirmation_email_template');
  t.parentName = booking.parentFirstName;
  t.numberOfChildren = booking.numberOfChildren;
  t.creations = creations.join('\n');
  t.additions = additions.join('\n');
  t.cake = booking.cake;
  t.cakeFlavour = booking.cakeFlavour;
  t.partyType = booking.location === 'mobile' ? 'mobile' : 'inStore';
  t.questions = booking.questions;
  
  var body = t.evaluate().getContent();
  var subject = "Thank you";

  // determine from address
  var fromAddress = determineFromEmailAddress(booking.location);

  var signature = getGmailSignature();
  
  // Send the confirmation email
  GmailApp.sendEmail(booking.parentEmail, subject, "", {from: fromAddress, htmlBody: body + signature, name : "Fizz Kidz"});
}