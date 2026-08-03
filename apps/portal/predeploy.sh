#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# For Apple Pay payments with Square, the cert must be deployed at apps/portal/public/.well-known/apple-develop-merchantid-domain-association
# To achieve this, at predeploy, place the appropriate dev/prod file at this location which has been verified in the Square dashboard
OUTDIR=apps/portal/public/.well-known
mkdir -p "$OUTDIR"

if [ "$GCLOUD_PROJECT" = 'booking-system-6435d' ]; then
    cp apps/portal/apple-certs/apple-developer-merchantid-domain-association-dev \
        "$OUTDIR/apple-developer-merchantid-domain-association"
    VP_SKIP_SERVER_BUILD=true vp build --mode dev
    exit 0
elif [ "$GCLOUD_PROJECT" = 'bookings-prod' ]; then
    cp apps/portal/apple-certs/apple-developer-merchantid-domain-association-prod \
        "$OUTDIR/apple-developer-merchantid-domain-association"
    VP_SKIP_SERVER_BUILD=true vp build --mode prod
    exit 0
else
    echo "firebase project $GCLOUD_PROJECT not recognized"
    exit 1
fi
