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

  const url = "https://australia-southeast1-bookings-prod.cloudfunctions.net/onFormSubmit"
  UrlFetchApp.fetch(url, options)
}
