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

  var t = HtmlService.createTemplateFromFile('booking-confirmation-mjml-template')
  if (t === null) {
    return
  }
  
  // Using the HTML email template, inject the variables and get the content
  t.parentName = booking.parentFirstName;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.startDate = buildFormattedStartDate(startDate)
  t.startTime = Utilities.formatDate(startDate, 'Australia/Sydney', 'hh:mm a');
  t.endTime = Utilities.formatDate(endDate, 'Australia/Sydney', 'hh:mm a');
  t.address = getPartyAddress(booking);
  t.location = booking.location;
  t.creationCount = creationCount;
  
  var mjml = t.evaluate().getContent();
  var body = createHtmlFromMjmlFile(mjml);
  var subject = "Party Booking Confirmation";

  let faqs = DriveApp.getFileById('1MRGm2RvtoskEFjfnQ1UJuxARvngl4ghw')

  const balwynPhotoId = '14mqrG74qkbE43FGqexGS1_zfb11mOONy'
  const essendonPhotoId = '1nOwuD1K43bveRc_UGQLeiw7uvXX6Fw2g'
  const malvernPhotoId = '1rqxePd3Xj846UO_czIpq_8JFw6jPeWZh'

  let photos = []

  if (booking.location === 'balwyn') {
    photos.push(DriveApp.getFileById(balwynPhotoId))
  } else if (booking.location === 'essendon') {
    photos.push(DriveApp.getFileById(essendonPhotoId))
  } else if (booking.location === 'malvern') {
    photos.push(DriveApp.getFileById(malvernPhotoId))
  }

  // Send the confirmation email
  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: 'bookings@fizzkidz.com.au',
      htmlBody: body,
      name: "Fizz Kidz",
      bcc: 'bookings@fizzkidz.com.au',
      attachments: [
        faqs.getBlob(),
        ...photos.map(photo => photo.getBlob())
      ],
      replyTo: booking.location === 'malvern' ? 'michaela@fizzkidz.com.au' : 'bonnie@fizzkidz.com.au'
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
  var preFilledUrl = getPreFilledFormURL(booking);
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('party_form_mjml_template')
  if (t === null) {
    return
  }

  t.parentName = booking.parentFirstName;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.startDate = buildFormattedStartDate(startDate)
  t.startTime = Utilities.formatDate(startDate, 'Australia/Sydney', 'hh:mm a');
  t.endTime = Utilities.formatDate(endDate, 'Australia/Sydney', 'hh:mm a');
  t.address = getPartyAddress(booking);
  t.location = booking.location;
  t.preFilledUrl = preFilledUrl;
  
  var mjml = t.evaluate().getContent();
  var body = createHtmlFromMjmlFile(mjml)
  var subject = `${booking.childName}'s party is coming up!`

  // determine the from email address
  var fromAddress = determineFromEmailAddress(booking.location);

  let faqs = DriveApp.getFileById('1MRGm2RvtoskEFjfnQ1UJuxARvngl4ghw')
  
  // Send the confirmation email
  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz",
      attachments: [
        faqs.getBlob()
      ]
    }
  );
}

function sendOutFormV2(booking) {
  // Determine the start and end times of the party
  var startDate = new Date(booking.dateTime)
  var endDate = getEndDate(startDate, booking.partyLength);
  
  // create a pre-filled form URL
  var preFilledUrl = getPreFilledFormUrlV2(booking);
  
  // Using the HTML email template, inject the variables and get the content
  var t = HtmlService.createTemplateFromFile('party_form_mjml_template')
  if (t === null) {
    return
  }

  t.parentName = booking.parentFirstName;
  t.childName = booking.childName;
  t.childAge = booking.childAge;
  t.startDate = buildFormattedStartDate(startDate)
  t.startTime = Utilities.formatDate(startDate, 'Australia/Sydney', 'hh:mm a');
  t.endTime = Utilities.formatDate(endDate, 'Australia/Sydney', 'hh:mm a');
  t.address = getPartyAddress(booking);
  t.location = booking.location;
  t.preFilledUrl = preFilledUrl;
  
  var mjml = t.evaluate().getContent();
  var body = createHtmlFromMjmlFile(mjml)
  var subject = `${booking.childName}'s party is coming up!`

  // determine the from email address
  var fromAddress = determineFromEmailAddress(booking.location);

  let faqs = DriveApp.getFileById('1MRGm2RvtoskEFjfnQ1UJuxARvngl4ghw')
  
  // Send the confirmation email
  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz",
      attachments: [
        faqs.getBlob()
      ]
    }
  );
}

function getPreFilledFormUrlV2(booking) {
  let url = `https://fizzkidz.paperform.co/?location=${booking.location}&id=${booking.id}`

  let encodedParams = {
    parent_first_name: encodeURIComponent(booking.parentFirstName),
    parent_last_name: encodeURIComponent(booking.parentLastName),
    child_name: encodeURIComponent(booking.childName),
    child_age: encodeURIComponent(booking.childAge),
  }

  Object.keys(encodedParams).forEach(key => {
    url += `&${key}=${encodedParams[key]}`
  })

  return url
}

/**
 * Creates a pre-filled URL for the party form
 *
 * @param {object} booking the booking object
 * @return {string} URL the url of the pre-filled form
 */
function getPreFilledFormURL(booking) {

  // form IDs
  var inStoreFormId = "1QSnxLYZG-wI3nO83WnKBkW2JNiIZx_cLyiOW-iXFC5U";
  var mobileFormId = "1aUNrC_IlDU6aeMna3VaG3eBXjJ_X8qMeSV1vaQtKjU8";
  
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
  GmailApp.sendEmail(fromAddress, subject, "", {from: "info@fizzkidz.com.au", htmlBody: body, name : "Fizz Kidz", replyTo: booking.parentEmail });
}

/**
 * Send a notifcation to Mattan that a grazing platter has been ordered
 * 
 * @param {object} booking the booking object
 */
function sendGrazingPlatterNotification(booking) {

   var t = HtmlService.createTemplateFromFile('grazing_platter_email_template')
   t.parentName = `${booking.parentFirstName} ${booking.parentLastName}`
   t.dateTime = Utilities.formatDate(new Date(booking.dateTime), "Australia/Melbourne", "EEEE, dd MMMM yyyy, HH:mm a")
   t.location = capitalise(booking.location)
   t.mobile = booking.parentMobile
   t.email = booking.parentEmail
   t.largePlatter = booking.grazingPlatterLarge
   t.mediumPlatter = booking.grazingPlatterMedium

   var body = t.evaluate().getContent()
   var subject = "Grazing platter order"
   
   // send
   GmailApp.sendEmail('thekitchencornerau@gmail.com', subject, "", { from: 'info@fizzkidz.com.au', htmlBody: body, name: "Fizz Kidz", cc: 'info@fizzkidz.com.au' })
}

/**
 * 
 * @param {Booking} booking 
 * @param {string[]} partyPacks 
 */
function sendPartyPacksNotification(booking, partyPacks) {
  var t = HtmlService.createTemplateFromFile('party_pack_email_template')
  t.parentName = `${booking.parentFirstName} ${booking.parentLastName}`
  t.dateTime = Utilities.formatDate(new Date(booking.dateTime), "Australia/Melbourne", "EEEE, dd MMMM yyyy, HH:mm a")
  t.location = capitalise(booking.location)
  t.mobile = booking.parentMobile
  t.email = booking.parentEmail
  t.partyPacks = partyPacks.join('\n')

  var body = t.evaluate().getContent()
  var subject = "Party Packs ordered!!"
  
  // send
  GmailApp.sendEmail('info@fizzkidz.com.au', subject, "", { from: 'info@fizzkidz.com.au', htmlBody: body, name: "Fizz Kidz" })
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

  const isTieDyeParty = creations.find(it => it.includes("Tie Dye")) !== undefined
  
  var t = HtmlService.createTemplateFromFile('customer_form_completed_confirmation_email_template');
  t.parentName = booking.parentFirstName;
  t.numberOfChildren = booking.numberOfChildren;
  t.creations = creations.join('\n');
  t.isTieDyeParty = isTieDyeParty;
  t.additions = additions.join('\n');
  t.cake = booking.cake;
  t.cakeFlavour = booking.cakeFlavour;
  t.partyType = booking.location === 'mobile' ? 'mobile' : 'inStore';
  t.location = booking.location;
  t.questions = booking.questions;
  
  var body = t.evaluate().getContent();
  var subject = "Your Party Details";

  // determine from address
  var fromAddress = determineFromEmailAddress(booking.location);

  var signature = getGmailSignature(booking.location === 'malvern' ? 'michaela' : 'bonnie');
  
  // Send the confirmation email
  GmailApp.sendEmail(booking.parentEmail, subject, "", {from: fromAddress, htmlBody: body + signature, name : "Fizz Kidz"});
}

/**
 * Sends an email asking for the customer to write a review
 * 
 * @param {object} booking the booking object
 */
function sendFeedbackEmail(booking) {
  var t = HtmlService.createTemplateFromFile('feedback_email_template')
  t.parentName = booking.parentFirstName
  t.childName = booking.childName
  t.location = booking.location

  const body = t.evaluate().getContent()
  const subject = "We hope you enjoyed your party!"
  const signature = getGmailSignature('lami')

  GmailApp.sendEmail(
    booking.parentEmail,
    subject,
    "",
    {
      from: 'bookings@fizzkidz.com.au',
      htmlBody: body + signature,
      name: "Fizz Kidz"
    }
  )
}

/**
 * Send an email to a parent asking if their child would like to continue with the term.
 * Provides two buttons, each with a link with encoded URL query params, which will update
 * their appointment with their selected choice.
 * 
 * @param {object} appointment a custom appointment object, not an Acuity appointment
 */
function sendTermContinuationEmail(appointment) {

  var t = HtmlService.createTemplateFromFile('science_club_term_enrolment_email')
  t.parentName = appointment.parentName
  t.childName = appointment.childName
  t.className = appointment.className
  t.continueUrl = appointment.continueUrl
  t.unenrollUrl = appointment.unenrollUrl
  t.termFee = appointment.price

  const mjml = t.evaluate().getContent()
  const body = createHtmlFromMjmlFile(mjml)
  const subject = "Thanks for coming to your free trial!"
  const fromAddress = 'info@fizzkidz.com.au'

  MailApp.sendEmail(
    appointment.email,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz"
    }
  )
}

/**
 * Send confirmation of unenrolment from science club
 * 
 * @param {object} appointment simplified appointment (not acuity)
 *  * includes:
 *  - parentName
 *  - email
 *  - className
 *  - childName
 */
function _sendUnenrolmentConfirmation(appointment) {

  var t = HtmlService.createTemplateFromFile('science_club_unenrolment_confirmation_email')
  t.parentName = appointment.parentName
  t.childName = appointment.childName
  t.className = appointment.className

  const mjml = t.evaluate().getContent()
  const body = createHtmlFromMjmlFile(mjml)
  const subject = "Unenrolment Confirmation"
  const fromAddress = 'info@fizzkidz.com.au'

  MailApp.sendEmail(
    appointment.email,
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz"
    }
  )

}