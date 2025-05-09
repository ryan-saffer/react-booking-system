#!/bin/bash
set -e # Exist immediately if a command exits with a non-zero status

# For Apple Pay payments with Square, the cert must be deployed at client/public/.well-known/apple-develop-merchantid-domain-association
# To achieve this, at predeploy, place the appropriate dev/prod file at this location which has been verified in the Square dashboard
OUTDIR=client/public/.well-known
mkdir -p "$OUTDIR"

if [[ $GCLOUD_PROJECT == 'booking-system-6435d' ]]; then
    cp client/apple-certs/apple-developer-merchantid-domain-association-dev \
        "$OUTDIR/apple-developer-merchantid-domain-association"
    cd client && npm run build:dev
    exit 0
elif [[ $GCLOUD_PROJECT == 'bookings-prod' ]]; then
    cp client/apple-certs/apple-developer-merchantid-domain-association-prod \
        "$OUTDIR/apple-developer-merchantid-domain-association"
    cd client && npm run build:prod
    exit 0
else
    echo "firebase project $GCLOUD_PROJECT not recognized"
    exit 1
fi