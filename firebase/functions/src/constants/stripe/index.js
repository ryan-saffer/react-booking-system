const stripeCredentials = require('../../../credentials/stripe_credentials.json')

exports.DEV_CONFIG = {
    PRICE_SCIENCE_CLUB: "price_1Gtj1JIhbh0YhdB7zAnYJwDN",
    SEND_INVOICE_ENDPOINT: "https://us-central1-bookings-prod.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com/test",
    API_KEY: stripeCredentials.dev_api_key
}

exports.PROD_CONFIG = {
    STRIPE_PRICE_SCIENCE_CLUB: "TODO",
    SEND_INVOICE_ENDPOINT: "https://us-central1-booking-system-6435d.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com",
    API_KEY: stripeCredentials.live_api_key
}