# How to generate csv of birthday parties

First export the variable inside `.env` to your path:
```sh
export GOOGLE_APPLICATION_CREDENTIALS="/Users/rsaffer/workspace/react-booking-system/scripts/bookings-prod-8ce541a294f6.json"
```
> The file has been excluded from git. If lost, regenerate it from Firebase Console (choose python) - https://console.firebase.google.com/u/1/project/bookings-prod/settings/serviceaccounts/adminsdk

Update the dates in `parties.py` to the date ranges, then run the script:
```sh
python3 parties.py
```
When uploading `results.csv` to hubspot, on the final step, ensure the date format is set to `dd/mm/yyyy`.