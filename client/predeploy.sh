#!/bin/bash

if [[ $GCLOUD_PROJECT == 'booking-system-6435d' ]]; then
    cd client && npm run build:dev
    exit 0
elif [[ $GCLOUD_PROJECT == 'bookings-prod' ]]; then
    cd client && npm run build:prod
    exit 0
else
    echo "firebase project $GCLOUD_PROJECT not recognized"
    exit 1
fi