function test() {

  var t = HtmlService.createTemplateFromFile('booking-confirmation-mjml-template')
  if (t === null) {
    return
  }
  
  // Using the HTML email template, inject the variables and get the content
  t.parentName = "Talia";
  t.childName = "Lucy";
  t.childAge = "8";
  t.startDate = "28th June 2021"
  t.startTime = "2:00 pm"
  t.endTime = "4:00 pm"
  t.address = "20 Glenferrie Rd, Malvern, 3144";
  t.location = "Malvern"
  t.creationCount = "3";
  // t.preFilledUrl = "https://www.google.com"
  
  var mjml = t.evaluate().getContent();
  var body = createHtmlFromMjmlFile(mjml, 'dev');
  
  console.log('recieved result:')
  console.log(body)
  
  // var body = t.evaluate().getContent();
  var subject = "Lucy's party is coming up!";
  
  // determine which account to send from
  var fromAddress = "info@fizzkidz.com.au"

  let faqs = DriveApp.getFileById('1MRGm2RvtoskEFjfnQ1UJuxARvngl4ghw')
  // let essendonPhoto = DriveApp.getFileById('1nOwuD1K43bveRc_UGQLeiw7uvXX6Fw2g')
  
  // Send the confirmation email
  GmailApp.sendEmail(
    "ryansaffer@gmail.com",
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz",
      attachments: [
        faqs.getBlob(),
        // essendonPhoto.getBlob()
      ]
    }
  );
}