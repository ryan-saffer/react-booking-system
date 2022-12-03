import firebase_admin
import csv
from firebase_admin import credentials
from firebase_admin import firestore

# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': "bookings-prod",
})

db = firestore.client()

appointments_ref = db.collection(u'scienceAppointments').where(u'status', u'==', 'active')

output = appointments_ref.stream()

f = open('result.csv', 'w')
writer = csv.writer(f)

for item in output:
    enrolment = item.to_dict()
    email = enrolment["parent"]["email"]

    writer.writerow([email])

f.close()