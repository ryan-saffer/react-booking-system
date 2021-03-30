import * as stripeCredentials from '../../../credentials/stripe_credentials'

export const DEV_CONFIG = {
    STRIPE_PRICE_195: "price_1IaZ4EIhbh0YhdB7jSoMwQ84",
    STRIPE_PRICE_173: "price_1IaZnrIhbh0YhdB7wRhFqJLH",
    STRIPE_PRICE_151: "price_1IaZo4Ihbh0YhdB7gFi5VJyp",
    STRIPE_PRICE_129: "price_1IaZoIIhbh0YhdB7BE5QNu9h",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-booking-system-6435d.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com/test",
    API_KEY: stripeCredentials.api_keys.dev_api_key
}

export const PROD_CONFIG = {
    STRIPE_PRICE_195: "term-2-2021",
    STRIPE_PRICE_173: "price_1IaZl6Ihbh0YhdB785gfNjb8",
    STRIPE_PRICE_151: "price_1IaZlNIhbh0YhdB70msuSsMo",
    STRIPE_PRICE_129: "price_1IaZlcIhbh0YhdB77sWCAkar",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-bookings-prod.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com",
    API_KEY: stripeCredentials.api_keys.live_api_key
}