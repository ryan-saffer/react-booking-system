# How to generate csv of birthday parties

First export the variable inside `.env` to your path:

```sh
# prod
export GOOGLE_APPLICATION_CREDENTIALS="/Users/rsaffer/workspace/react-booking-system/scripts/bookings-prod.json"

# dev
export GOOGLE_APPLICATION_CREDENTIALS="/Users/rsaffer/workspace/react-booking-system/scripts/booking-system-6435d-firebase-adminsdk-km04g-9bdbdeb0e2.json"
```

> The file has been excluded from git. If lost, regenerate it from Firebase Console (choose python) - https://console.firebase.google.com/u/1/project/bookings-prod/settings/serviceaccounts/adminsdk

Update the dates in `parties.py` to the date ranges, then run the script:

```sh
python3 parties.py
```

When uploading `results.csv` to hubspot, on the final step, ensure the date format is set to `dd/mm/yyyy`.

