import * as stripeCredentials from '../../../credentials/stripe_credentials'

export const DEV_CONFIG = {
    STRIPE_PRICE_SCIENCE_CLUB: "price_1Gtj1JIhbh0YhdB7zAnYJwDN",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-booking-system-6435d.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com/test",
    API_KEY: stripeCredentials.api_keys.dev_api_key
}

export const PROD_CONFIG = {
    STRIPE_PRICE_SCIENCE_CLUB: "term-2-2021",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-bookings-prod.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com",
    API_KEY: stripeCredentials.api_keys.live_api_key
}