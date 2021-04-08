function test() {

  var rawHtml = HtmlService.createTemplateFromFile('test-email').getRawContent()

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
    return
  }
  
  var t = HtmlService.createTemplate(JSON.parse(content).html);
  t.parentName = "Talia";
  t.childName = "Lucy";
  t.childAge = "8";
  t.startDate = "28th June 2021"
  t.startTime = "2:00 pm"
  t.endTime = "4:00 pm"
  t.address = "20 Glenferrie Rd, Malvern, 3144";
  t.location = "Malvern"
  t.creationCount = "3";
  
  var body = t.evaluate().getContent();
  var subject = "Party Booking Confirmation";
  
  // determine which account to send from
  var fromAddress = "info@fizzkidz.com.au"
  
  // Send the confirmation email
  GmailApp.sendEmail(
    "ryansaffer@gmail.com",
    subject,
    "",
    {
      from: fromAddress,
      htmlBody: body,
      name: "Fizz Kidz"
    }
  );
}