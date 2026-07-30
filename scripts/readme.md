# How to generate csv of birthday parties

First point `GOOGLE_APPLICATION_CREDENTIALS` at the service account key for the environment you want. Run these from the `scripts/` directory:

```sh
# prod
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/bookings-prod.json"

# dev
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/bookings-dev.json"
```

> The file has been excluded from git. If lost, regenerate it from Firebase Console (choose python) - https://console.firebase.google.com/u/1/project/bookings-prod/settings/serviceaccounts/adminsdk

Update the dates in `parties.py` to the date ranges, then run the script:

```sh
python3 parties.py
```

When uploading `results.csv` to hubspot, on the final step, ensure the date format is set to `dd/mm/yyyy`.

