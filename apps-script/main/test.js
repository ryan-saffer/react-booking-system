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

function testBackupScienceClub(appointmentsMap) {

  console.log(appointmentsMap)

  const spreadsheetId = '1t9R_P-zibGHPS4qYucUpRYMHMiY5a7EMhs5XxaeCMi8'
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)

  for (const [key, value] of Object.entries(appointmentsMap)) {
    var sheet = spreadsheet.getSheetByName(key)

    // check if class already exists (this should only occur on week 1)
    if (sheet == null) {
      sheet = spreadsheet.insertSheet(key)
      sheet.appendRow(['Parent First Name', 'Parent Last Name', 'Parent Phone', 'Parent Email', 'Child Name', 'Child Grade', 'Label', 'Notes', 'Checked Out By', 'Checkout Time'])
      sheet.getRange('A1:J1').setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    // merge next row into single cell for the date
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 10)
      .merge()
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')

    // append date
    const date = new Date()
    sheet.appendRow([date.toLocaleDateString()])

    // append each appointment
    value.forEach(appointment => {
      sheet.appendRow([
        appointment.parentFirstName,
        appointment.parentLastName,
        appointment.parentPhone,
        appointment.parentEmail,
        appointment.childName,
        appointment.childGrade,
        appointment.label,
        appointment.notes,
        appointment.checkoutPerson,
        appointment.checkoutTime
      ])
    })
  }
}
