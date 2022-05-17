function test() {

  var rawHtml = HtmlService.createTemplateFromFile('party_form_mjml_template').getRawContent()

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
  // t.creationCount = "3";
  t.preFilledUrl = "https://www.google.com"
  
  var body = t.evaluate().getContent();
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