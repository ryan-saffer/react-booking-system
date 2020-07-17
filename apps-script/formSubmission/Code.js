function onSubmit(e) {
  
  console.log("form submitted with values:")
  console.log(JSON.stringify(e.values))
  console.log(e)
  
  const data = {
    values: e.values
  }
  
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  }

  const url = "https://us-central1-booking-system-6435d.cloudfunctions.net/onFormSubmit"
  UrlFetchApp.fetch(url, options)
}
