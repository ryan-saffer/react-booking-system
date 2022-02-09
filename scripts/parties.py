import firebase_admin
import datetime
import csv
from firebase_admin import credentials
from firebase_admin import firestore

# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': "bookings-prod",
})

db = firestore.client()

users_ref = db.collection(u'bookings').where(u'dateTime', u'>=', datetime.datetime(2021, 6 , 1)).where(u'dateTime', '<=', datetime.datetime(2021, 12, 15))

output = users_ref.stream()

f = open('result.csv', 'w')
writer = csv.writer(f)

writer.writerow(["First Name", "Last Name", "Email", "Child Name", "Child Age", "Branch", "Party Date", "Service"])

for booking in output:
    party = booking.to_dict()
    dateTime = party["dateTime"]
    formattedDate = f'{dateTime.day}/{dateTime.month}/{dateTime.year}'
    if (party["location"] == "mobile"):
      service = "Mobile Party"
    else:
      service = "In-store Party"

    writer.writerow([party["parentFirstName"], party["parentLastName"], party["parentEmail"], party["childName"], party["childAge"], party["location"], formattedDate, service])

f.close()