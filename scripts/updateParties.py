import firebase_admin
import datetime
from firebase_admin import credentials
from firebase_admin import firestore

# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': "bookings-prod",
})

db = firestore.client()

users_ref = db.collection(u'bookings').where(u'dateTime', u'>=', datetime.datetime(2022, 4, 28)).where(u'dateTime', '<=', datetime.datetime(2023, 12, 30))

output = users_ref.stream()

for booking in output:
    party = booking.to_dict()
    notes = party["notes"]
    print(f'updating booking with id: {booking.id}')
    print(notes)
    document_ref = db.collection(u'bookings').document(booking.id)
    print(document_ref)
    document_ref.set({
        u'notes': "USE OLD PARTY PRICE\n- - - - - - - - - - - - - - - - - - - - \n\n" + party["notes"]
    }, merge = True)